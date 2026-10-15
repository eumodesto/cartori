# Inventário da plataforma InterJuri

Levantamento do código em 8 de outubro de 2026, para revisão de arquitetura, segurança e banco de dados. Mercado Pago está configurado parcialmente por decisão do produto.

## 1. Visão geral

Marketplace de certidões cartoriais com três áreas:

- **Vitrine pública:** catálogo, carrinho e checkout.
- **Painel do cliente:** pedidos, dossiês e empresa.
- **Áreas internas:** mesa operacional e administração.

O pedido é pago via Mercado Pago e vira um caso operacional com mensagens, anexos e máquina de status.

| Indicador | Valor |
|---|---|
| Páginas | 29 |
| Handlers de API | 37 em `src/app/api` + `/auth/callback` |
| Modelos Prisma | 19 |
| Migrations | 14 |
| Papéis | 3 de plataforma + 3 de empresa |

### Stack

| Camada | Tecnologia | Onde |
|---|---|---|
| Framework | Next.js 14.2 (App Router), React 18, TypeScript 5.6 | `package.json` |
| UI | Tailwind 3.4, design system próprio, lucide-react, framer-motion, gsap | `src/components` (82 arquivos) |
| Banco | PostgreSQL no Supabase (sa-east-1) via Prisma 5 | `prisma/schema.prisma` |
| Identidade | Supabase Auth (`@supabase/ssr`), sessão em cookie, `User.authId` | `src/lib/auth.ts` |
| Pagamento | Mercado Pago (PIX e cartão via Card Brick), webhook assinado | `src/lib/payments.ts` |
| IA | OpenAI (`gpt-4o-mini` por padrão) para a assistente Amanda | `src/app/api/amanda/chat` |
| E-mail | Resend, com `EmailOutbox` e templates editáveis | `src/lib/email.ts` |
| Arquivos | Supabase Storage: `case-files` (privado, URL assinada) e `avatars` (público) | `src/lib/case-storage.ts` |
| Deploy | Vercel (time `cartori`, projeto `cartori`), build via `scripts/vercel-build.mjs` | `vercel.json` |
| Dados externos | BrasilAPI / ReceitaWS (CNPJ), ViaCEP; IBGE como snapshot estático (a API ao vivo falha no Node por cadeia TLS incompleta) | `src/lib/cnpj.ts`, `viacep.ts`, `ibge.ts`, `ibge-localidades.json` |

### Estrutura do repositório

| Pasta | Conteúdo |
|---|---|
| `src/app` | 29 páginas: vitrine, checkout, painel, mesa operacional, admin |
| `src/app/api` | 37 handlers de API |
| `src/lib` | ~70 módulos: policy de autorização, stores (order, case, dossier, product), integrações, validadores |
| `src/components` | ui (design system), storefront, dashboard, auth, cartori (Amanda) |
| `src/middleware.ts` | Renova a sessão Supabase; redireciona anônimo em `/painel`, `/operacao`, `/admin` |
| `prisma` | schema + 14 migrations (revoke da Data API e RLS deny-all) |
| `scripts` | Build da Vercel, banco de teste, inspeção de RLS e 3 checks HTTP manuais (etapa 4 a 6, rodados com `tsx`) |
| `.agents/skills` | 8 skills de procedimento (auth, tenant, pedidos, pagamento, banco, Amanda, catálogo, testes) |
| `docs` | `ARCHITECTURE_AND_MVP_PLAN.md` (ER, roadmap) e este inventário |

### Fluxo principal

1. O cliente escolhe a certidão no catálogo e preenche o formulário.
2. O pedido fica no carrinho (localStorage).
3. O checkout exige login.
4. `POST /api/orders` recalcula o preço no servidor e grava `Order` e os `OrderItem`.
5. Em `/pedido/[id]` o cliente paga por PIX ou cartão.
6. O webhook assinado reconcilia o `Payment` e muda o `Order` para `PAID`. Pagamento feito fora do site é registrado manualmente pelo ADMIN (ver seção 2).
7. A mesa operacional conduz o caso até `CERTIFICATE_ISSUED`, `SHIPPED` ou `COMPLETED`, com e-mails ao cliente.

### Invariantes (AGENTS.md)

- `authId` é a identidade canônica.
- Conhecer um UUID não dá acesso.
- O browser não define privilégio.
- A autorização é server-side e fail-closed.
- `User.role` e `OrganizationMemberRole` são papéis diferentes.
- O tenant é uma membership `ACTIVE`.
- `Organization` não é `Partner`.
- O pedido B2C pertence ao `userId` que o criou.
- O pagamento é server-authoritative: valor e status vêm do servidor. Única exceção: o ADMIN registra pagamento, recusa ou estorno feito fora do site, com motivo e histórico.

## 2. Níveis de acesso

Há duas camadas independentes:

- **Papel na plataforma (`User.role`):** decide o acesso às áreas internas.
- **Papel na empresa (`OrganizationMember.orgRole`):** vale só com status `ACTIVE` e decide a gestão do CNPJ.

Ser membro de uma empresa não dá leitura dos pedidos dos colegas.

### Papéis de plataforma

| Papel | Origem | Pode | Áreas |
|---|---|---|---|
| `CLIENT` | Padrão no cadastro | Próprios pedidos, dossiês, mensagens e anexos. Cadastra empresa. Usa a Amanda após o 1º pedido. | `/painel/*` |
| `OPERATOR` | Promovido por ADMIN | Tudo do CLIENT na própria conta. Na mesa, lê qualquer pedido, muda status (só transições válidas), conversa e anexa. | `/painel`, `/operacao/*` |
| `ADMIN` | Promovido por ADMIN | Tudo do OPERATOR, mais usuários e papéis, configuração do Resend e templates de e-mail. | `/painel`, `/operacao/*`, `/admin/*` |

### Papéis na empresa

| orgRole | Origem | Pode |
|---|---|---|
| `OWNER` | Quem cadastrou o CNPJ | Atualizar os dados da empresa |
| `ADMIN` | Futuro (convites) | Atualizar os dados da empresa. Não é o ADMIN da plataforma. |
| `MEMBER` | Futuro (convites) | Pertence à empresa, mas não faz onboarding nem vê pedidos de colegas |

O plano padrão é `STANDARD`. O plano `PARTNER` existe no enum, mas não tem fluxo de ativação. O bloqueio dos menus B2B é só visual (`B2B_LOCKED_HREFS`).

### Matriz de capacidades

Na matriz, 404 significa recurso escondido (fail-closed) e 403 significa proibido explicitamente.

| Ação | CLIENT | OPERATOR | ADMIN | Guarda no código |
|---|---|---|---|---|
| Ver e editar o próprio perfil, senha, e-mail e avatar | sim | sim | sim | `requireAuth` |
| Criar pedido (preço calculado no servidor) | sim | sim | sim | `requireAuth` + `order-store` |
| Ver o próprio pedido e pagar por PIX ou cartão | sim | sim | sim | `loadOwnedOrder` (userId) |
| Ver o pedido de outra pessoa pela rota do cliente | 404 | 404 | 404 | `loadOwnedOrder` |
| Mensagens e anexos do próprio pedido | sim | sim | sim | `requireOrderCaseAccess` |
| Mensagens e anexos de qualquer pedido | 404 | sim | sim | `requireOrderCaseAccess` (staff) |
| Fila operacional e mudança de status | 404 | sim | sim | `requireStaffOps` + transições |
| Próprios dossiês | sim | sim | sim | `requireDossierAccess` |
| Cadastrar empresa (CNPJ + OAB/CRECI) | sim | 403 | 403 | `canOnboardBusiness` |
| Usuários, papéis, e-mails, templates e configurações (tags) | 403 | 403 | sim | `requirePlatformAdmin` |
| Amanda (chat com IA) | com pedido | 403 | 403 | `requireAmandaClient` |
| Marcar pedido como pago pelo fluxo normal | não | não | não | só o webhook ou a reconciliação do Mercado Pago |
| Registrar pagamento, recusa ou estorno manual | 403 | 403 | sim | `requirePlatformAdmin` + `manual-payment.ts` (motivo obrigatório, valor do pedido, `CaseEvent`; não movimenta dinheiro) |

### Ainda não implementado

| Capacidade | Matriz | Situação |
|---|---|---|
| Listar pedidos e dossiês da empresa | FUTURE / TBD | Fail-closed; falta definir as permissões por orgRole |
| Convites e gestão de equipe | FUTURE | Memberships ADMIN e MEMBER não são criadas por nenhum fluxo |
| Atribuir pedido a um operador | TBD | Todo OPERATOR vê a fila inteira |
| Plano PARTNER (revenda) | TBD | Nenhuma rota ativa o plano |
| ADMIN global sobre tenants | FUTURE | `allowGlobalAdmin` existe na policy, mas não é usado |

## 3. Sitemap

O middleware renova a sessão em toda rota e manda anônimos de `/painel`, `/operacao` e `/admin` para `/?entrar=1&next=…`. O papel é verificado no layout (no cliente) e, de forma autoritativa, em cada API.

### Vitrine e compra

| Rota | Função | Acesso | Nota |
|---|---|---|---|
| `/` | Catálogo, FAQ, seção B2B, depoimentos | Público | |
| `/certidao/[slug]` | Produto e formulário dinâmico | Público | Catálogo do banco com fallback estático |
| `/carrinho` | Revisão do pedido | Público | localStorage |
| `/checkout` | Solicitante, entrega, pagamento | Login obrigatório (modal) | Fechar o modal volta para `/carrinho` |
| `/pedido/[id]` | Pagamento (PIX/QR, cartão) e confirmação | Dono do pedido | 401 leva ao login; 404 se não é dono |
| `/pos-login` | Redireciona conforme o papel | Autenticado | |
| `/suporte`, `/contato` | Atendimento | Público | |
| `/termos`, `/privacidade` | Documentos legais (aceite no cadastro) | Público | `TERMS_VERSION` |
| `/design-system` | Vitrine de componentes | Público | Exposto em produção |
| `/auth/callback` | Confirmação de e-mail | Público | Conclui a empresa pendente do cadastro |

### Painel do cliente

| Rota | Função | Acesso | Nota |
|---|---|---|---|
| `/painel` | Visão geral | Autenticado | |
| `/painel/pedidos`, `/painel/pedidos/[id]` | Pedidos e caso (status, mensagens, anexos) | Dono | A API filtra por userId |
| `/painel/dossies`, `/novo`, `/[id]` | Dossiês de análise | Dono | |
| `/painel/cartorios` | Consulta de cartórios | Autenticado | |
| `/painel/perfil` | Dados, avatar, e-mail, senha, alertas | Autenticado | |
| `/painel/empresa`, `/equipe`, `/financeiro` | Gestão B2B | Empresa ACTIVE | Placeholder (`PartnerGate`) |

### Áreas internas

| Rota | Função | Acesso |
|---|---|---|
| `/operacao` (abre `/operacao/pedidos`) | Fila operacional | OPERATOR, ADMIN |
| `/operacao/pedidos/[id]` | Caso: status, mensagens, anexos, e-mail ao cliente | OPERATOR, ADMIN |
| `/admin` (abre `/admin/usuarios`) | Usuários e papéis | ADMIN |
| `/admin/usuarios/[id]` | Detalhe e troca de papel | ADMIN |
| `/admin/emails` | Resend e templates | ADMIN |

As rotas antigas `/dashboard/*` redirecionam com 308 para `/painel`, `/operacao` e `/admin`. A lista está em `next.config.mjs`.

## 4. API

| Grupo | Método | Rota | Guarda / limite | Comportamento |
|---|---|---|---|---|
| Auth | POST | `/api/auth/signup` | Público · 8 req/15 min/IP | Pessoa ou empresa; termos, confirmação de senha, OAB/CRECI |
| Auth | POST | `/api/auth/login` | Público · 8 req/15 min/IP | 403 se o e-mail não foi confirmado |
| Auth | POST | `/api/auth/logout` | Sessão | |
| Auth | GET | `/api/auth/me` | Opcional | Retorna o profile ou null |
| Auth | GET | `/auth/callback` | Código Supabase | `syncAuthUser` + `completePendingCompany` |
| Conta | PATCH | `/api/account/profile` | `requireAuth` | Nome, telefone, CPF, preferências |
| Conta | POST | `/api/account/avatar` | `requireAuth` | Bucket público `avatars` |
| Conta | POST | `/api/account/email` | `requireAuth` | Troca de e-mail |
| Conta | POST | `/api/account/password` | `requireAuth` | Troca de senha |
| Conta | GET | `/api/account/alerts` | `requireAuth` | Alertas do painel |
| Pedidos | GET/POST | `/api/orders` | `requireAuth` | Lista os próprios; cria com preço do servidor |
| Pedidos | GET | `/api/orders/[id]` | Dono | 404 para quem não é dono |
| Pedidos | POST | `/api/orders/[id]/card` | Dono | Cobrança no cartão |
| Pedidos | POST | `/api/orders/[id]/simulate-pay` | — | Desativado (403) |
| Pedidos | GET/POST | `/api/orders/[id]/messages` | Dono ou staff | Thread do caso |
| Pedidos | POST | `/api/orders/[id]/attachments` | Dono ou staff | Emite URL assinada de upload |
| Pedidos | POST | `/api/orders/[id]/attachments/complete` | Dono ou staff | Valida tamanho e MIME, depois registra |
| Pedidos | GET | `/api/orders/[id]/attachments/[attachmentId]` | Dono ou staff | URL assinada de download |
| Dossiês | GET/POST | `/api/dossiers` | `requireAuth` | Lista e cria os próprios |
| Dossiês | GET | `/api/dossiers/[id]` | `requireDossierAccess` | 404 para quem não é dono |
| Dossiês | POST | `/api/dossiers/[id]/subjects` | `requireDossierAccess` | Sujeitos e identificadores |
| Mesa | GET | `/api/ops/orders` | `requireStaffOps` | Fila completa |
| Mesa | GET/PATCH | `/api/ops/orders/[id]` | `requireStaffOps` | Retorna `allowedStatuses`; 400 em transição inválida |
| Admin | GET | `/api/admin/users` | ADMIN | Busca de usuários |
| Admin | GET/PATCH | `/api/admin/users/[id]` | ADMIN | Troca de papel |
| Admin | GET | `/api/admin/users/[id]/orders` | ADMIN | Pedidos do usuário com status e ações permitidas |
| Admin | PATCH | `/api/admin/orders/[id]/status` | ADMIN | Etapa da mesa ou ação manual de pagamento (motivo obrigatório) |
| Admin | GET/PUT | `/api/admin/email-settings` | ADMIN | Chave do Resend e remetente (`AppSetting`) |
| Admin | GET | `/api/admin/email-templates` | ADMIN | Lista os templates |
| Admin | PUT/DELETE | `/api/admin/email-templates/[key]` | ADMIN | Grava override ou volta ao padrão |
| Admin | POST | `/api/admin/email-templates/[key]/preview` | ADMIN | Pré-visualização |
| Empresa | POST | `/api/org` | `requireAuth` + `canOnboardBusiness` | CNPJ ativo; cria OWNER ACTIVE |
| Empresa | POST | `/api/org/partner` | Idem | Alias legado; não concede PARTNER |
| Pagamento | POST | `/api/payments/webhook` | HMAC `x-signature` | Reconcilia payment e merchant_order |
| IA | GET/POST | `/api/amanda/chat` | CLIENT com pelo menos 1 pedido | OpenAI; sem limite de uso |
| Público | GET | `/api/cnpj/[cnpj]` | 10 req/min/IP | BrasilAPI, com ReceitaWS como reserva |
| Público | GET | `/api/cep/[cep]` | 30 req/min/IP | ViaCEP |
| Público | GET | `/api/cartorios` | — | Banco com fallback estático |
| Público | GET | `/api/locations/states`, `/cities` | — | IBGE com fallback |

## 5. Banco de dados

O banco é PostgreSQL no Supabase, acessado pelo Prisma. Em runtime a conexão usa o pooler (porta 6543); as migrations usam a conexão direta (porta 5432).

### Modelos

| Modelo | Campos-chave | Papel no domínio |
|---|---|---|
| `User` | authId, email, cpf (todos únicos), role, avatarUrl, notificationPrefs | `authId` é a identidade canônica; `role` é o papel de plataforma |
| `Organization` | cnpj (único), plan, cnpjVerifiedAt, oabNumber, creciNumber, endereço | Empresa cliente (tenant); não é Partner |
| `OrganizationMember` | (userId, organizationId) único, orgRole, status | Fonte de verdade do tenant; uma empresa ACTIVE por usuário (regra só no código) |
| `Order` | orderNumber, protocol, userId, organizationId, sellerOrgId, status, totais Decimal, cópia dos dados do solicitante e da entrega | O dono é o userId; organizationId é só contexto |
| `OrderItem` | tipo, UF/cidade, cartorioId, documentData (JSON), formato, preços | Preço congelado no momento da venda |
| `Payment` | providerPaymentId (único), provider, método, status, amount, QR do PIX | O status vem do Mercado Pago, ou do ADMIN quando `provider = MANUAL` |
| `Cartorio` | cns (único), atribuições, UF/cidade | Complementado pela lista estática em `src/lib/cartorios.ts` |
| `Product`, `ProductField`, `ProductPrice` | slug, preço base, taxas, campos dinâmicos, preço por UF e formato | Catálogo com fallback estático (`catalog.ts`) |
| `Dossier`, `DossierSubject`, `SubjectIdentifier` | finalidade, status, sujeitos, identificadores | O dono é o userId |
| `CaseMessage`, `CaseAttachment`, `CaseEvent` | thread, anexos, eventos | Caso operacional do pedido |
| `EmailOutbox` | destinatário, template, status, tentativas, último erro | Registro de envio; não há rotina de reenvio |
| `EmailTemplate`, `AppSetting` | override de template; configuração chave/valor | Só o servidor acessa; RLS fechada |

### Enums principais

- `UserRole`: CLIENT, OPERATOR, ADMIN
- `OrganizationMemberRole`: OWNER, ADMIN, MEMBER
- `OrganizationMemberStatus`: ACTIVE, REMOVED
- `OrganizationPlan`: STANDARD, PARTNER
- `OrderStatus`: DRAFT, PENDING_PAYMENT, PAID, IN_ANALYSIS, IN_CARTORIO_SEARCH, WAITING_CUSTOMER, CERTIFICATE_ISSUED, SHIPPED, COMPLETED, CANCELLED
- `PaymentStatus`: PENDING, APPROVED, IN_PROCESS, REJECTED, CANCELLED, REFUNDED
- `PaymentMethod`: PIX, CREDIT_CARD, BOLETO, B2B_INVOICE
- `DossierStatus`: DRAFT, RUNNING, PARTIAL, READY, EXPIRED, ARCHIVED

### Máquina de status do pedido

| De | Para (mesa operacional) |
|---|---|
| PENDING_PAYMENT | O webhook APPROVED (ou o pagamento manual do ADMIN) leva a PAID. A mesa só pode mudar para WAITING_CUSTOMER ou CANCELLED. |
| PAID | IN_ANALYSIS, IN_CARTORIO_SEARCH, WAITING_CUSTOMER, CANCELLED |
| IN_ANALYSIS / IN_CARTORIO_SEARCH | Avança para a emissão ou volta a aguardar o cliente |
| CERTIFICATE_ISSUED | SHIPPED ou COMPLETED |
| COMPLETED / CANCELLED | Terminais |

A mesa nunca define PAID; esse status vem da reconciliação do Mercado Pago ou do pagamento manual do ADMIN. Estorno (do Mercado Pago ou manual) cancela o pedido em qualquer etapa. As regras estão em `STAFF_STATUS_TRANSITIONS`, em `authorization-policy.ts`, e em `manualPaymentActions`, em `manual-payment-policy.ts`.

O cliente vê um status oficial (`displayOrderStatus`, em `order-status.ts`): Pagamento Pendente, Pagamento Recusado, Pagamento Realizado, Documento em Emissão, Aguardando Cliente, Documento Entregue, Compra Estornada e Pedido Cancelado.

### Acesso ao banco

- A aplicação usa o role `postgres` via Prisma, que ignora o RLS.
- Os roles `anon` e `authenticated` da Data API do Supabase têm REVOKE em todas as tabelas, e o RLS está ligado sem nenhuma policy. Isso inclui `AppSetting`, `EmailTemplate` e a tabela legada `PlatformAuditLog`.
- Índices relevantes: `Order(userId)`, `Order(organizationId)`, `Order(status)`, `Order(channel, createdAt)`, `OrganizationMember(userId, status)`.

### Migrations aplicadas

`init` · `auth_and_partner_plan` · `order_item_cartorio_fk` · `product_catalog` · `revoke_data_api_anon_authenticated` · `organization_member` · `retire_user_business_legacy` · `dossier_subject_identifier` · `lock_public_rls_deny_data_api` · `order_case_desk` · `email_templates_settings` · `user_avatar_notifications` · `order_owner_index_and_settings_rls` · `lock_platform_audit_log_rls`

## 6. Segurança

| Controle | Implementação | Estado |
|---|---|---|
| Autorização server-side fail-closed | `requireAuth` + policy pura; papel, userId e orgId do body são ignorados | Firme |
| Ownership de pedido e dossiê | userId do contexto; quem não é dono recebe 404 | Firme |
| Preço no servidor | O pedido é recalculado; o webhook compara o valor em centavos | Firme |
| Webhook assinado | HMAC `x-signature`; sem o segredo responde 401 | Falta configurar o segredo |
| Confirmação de e-mail | O cadastro envia o link; o login bloqueia e-mail não confirmado | Firme (depende de "Confirm email" ligado no Supabase) |
| Data API fechada | REVOKE + RLS sem policy | Firme |
| Upload de anexos | URL assinada; a etapa de conclusão valida tamanho e MIME | Firme |
| Headers HTTP | nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, CSP, HSTS em produção | Parcial (CSP permissiva) |
| Limite de requisições | login, cadastro, CNPJ, CEP | Fraco (fica na memória de cada processo) |
| Transições de status | Pedido sem pagamento não avança | Firme |
| Segredos | `.env.local` está no `.gitignore` | Senha do banco precisa ser trocada |

Scripts de validação:

- Policy, matriz, regras de org, membership, templates de e-mail, pedidos e conciliação: suíte Vitest (`tests/unit`, `tests/db`), executada no CI.
- `etapa4/5/6-http-check.ts`: testam via HTTP com usuários reais e exigem o servidor rodando.
- `inspect-supabase-rls.ts`: confere o RLS no banco real e passa.

Nenhum desses scripts roda em CI.

## 7. Integrações e ambiente

| Serviço | Uso | Se falhar |
|---|---|---|
| Supabase Auth | Cadastro com confirmação, login por senha | O login para |
| Supabase Postgres | Todos os dados | Catálogo e cartórios usam dados estáticos; pedidos falham |
| Supabase Storage | `case-files` (privado) e `avatars` (público, criado em runtime) | O upload retorna 500 |
| Mercado Pago | PIX, cartão, webhook | O pedido fica em PENDING_PAYMENT |
| OpenAI | Amanda | O widget fica indisponível |
| Resend | E-mails, com registro na outbox | O e-mail fica PENDING sem reenvio |
| BrasilAPI / ReceitaWS | CNPJ | O cadastro de empresa fica bloqueado (503) |
| ViaCEP / IBGE | Endereço, UF e municípios | O IBGE tem fallback mínimo |

| Variável | Uso | Estado |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth | Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage e operações administrativas de Auth | Configurado |
| `DATABASE_URL` (pooler) e `DATABASE_URL_UNPOOLED` (direta) | Prisma em runtime e migrations | Configurado |
| `NEXT_PUBLIC_SITE_URL` | Links de e-mail e callback | Configurado |
| `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET` | Cobrança e webhook | Pendente (Mercado Pago adiado) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Card Brick | Configurado |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Amanda | Chave vazia no ambiente local |
| `RESEND_API_KEY`, `EMAIL_FROM` | E-mail (a tabela `AppSetting` tem prioridade) | Via `/admin/emails` |

## 8. Riscos e propostas

| Sev. | Área | Ponto | Onde | Proposta |
|---|---|---|---|---|
| Alto | Segurança | Limite de requisições em memória não funciona em serverless | `src/lib/rate-limit.ts` | Redis (Upstash ou Vercel KV) ou tabela Postgres com janela deslizante; estender a `/api/orders`, `/api/amanda/chat` e `/api/account/*` |
| Alto | Pagamento | Webhook sem segredo; pagamento manual aprovado não invalida um PIX já emitido (o cliente ainda pode pagar em dobro) | env · `src/lib/manual-payment.ts` | Configurar o segredo; cancelar o PIX pendente no Mercado Pago ao aprovar manualmente; advisory lock no Postgres ao criar o PIX |
| Alto | Operação | A outbox não tem rotina de reenvio | `src/lib/email.ts` · `case-email.ts` | Cron da Vercel com `CRON_SECRET`, backoff e FAILED depois de N tentativas |
| Alto | Qualidade | CI e testes unitários/de banco já existem, mas os checks HTTP críticos ainda são manuais | `.github/workflows/ci.yml`, `tests/`, `scripts/etapa*.ts` | Manter Vitest e CI; adicionar Playwright/HTTP smoke tests aos fluxos críticos e executar os scripts de integração em ambiente controlado |
| Médio | Acesso | `/operacao` e `/admin` só são protegidos no cliente | layouts de `operacao` e `admin` | Layout server-side com `getAuthProfile()` e `notFound()` |
| Médio | Acesso | Todo OPERATOR vê a fila inteira e todos os dados pessoais | `requireStaffOps` | Campo `assigneeId`, filas e auditoria de leitura (LGPD, menor privilégio) |
| Médio | Banco | A regra de uma empresa ACTIVE por usuário só existe no código | `org-membership.ts` | `UNIQUE (userId) WHERE status = 'ACTIVE'` |
| Médio | Segurança | CSP com `unsafe-inline` e `unsafe-eval` | `next.config.mjs` | Nonce por requisição gerado no middleware |
| Médio | Custo | Amanda e criação de pedido sem limite de uso | `/api/amanda/chat`, `/api/orders` | Limite por usuário e teto diário de tokens |
| Médio | Produto | O painel B2B é só placeholder | `/painel/empresa`, `/equipe`, `/financeiro` | Definir as permissões por orgRole; implementar convites, visão da empresa e extrato |
| Médio | Dados | Fallback estático ainda permitido, embora a origem já seja observável | `product-store.ts`, `cartorios.ts`, `/api/cartorios` | Medir ocorrências, completar o catálogo oficial e depois bloquear o checkout quando o preço não vier do banco |
| Baixo | Exposição | `/design-system` é público em produção | `src/app/design-system` | Restringir a ADMIN ou tirar do build |
| Baixo | Documentação | Parte da documentação divergia do código atual | `README.md`, `.agents/skills`, `docs/` | Manter este inventário como fonte de estado, remover caminhos inexistentes e atualizar o README com os comandos oficiais |
| Baixo | Segredos | A senha do banco foi compartilhada em conversa | Supabase · Vercel | Trocar a senha e atualizar as duas URLs de conexão |
| Baixo | Storage | Bucket `avatars` público e criado em runtime | `avatar-storage.ts` | Criar via infra; limitar MIME e tamanho; não usar o userId no nome do arquivo |
