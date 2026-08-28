# Cartori Design System V1 — Manual Técnico Oficial

Documento mestre de especificações, diretrizes visuais, arquitetura de tokens, patterns operacionais e governança de componentes da plataforma **Cartori**.

> **Status:** Fundação aprovada para implementação V1  
> **Escopo:** SaaS B2B, Backoffice Cartorial e Superfícies Compartilhadas

---

## 01. Propósito e Escopo

O **Cartori Design System** é a camada de referência visual, comportamental e técnica usada para construir interfaces consistentes dentro do ecossistema Cartori. Ele não substitui a arquitetura de produto ou o motor de negócio; ele define como esse produto deve aparecer e se comportar.

### Princípio Central
Compartilhar regras de design e primitives, sem obrigar todas as superfícies a parecerem idênticas. O e-commerce B2C, o SaaS B2B, o backoffice e o white-label pertencem à mesma marca, mas possuem densidades e objetivos diferentes.

### Matriz de Superfícies Atendidas

| Superfície | Objetivo | Características Visuais e Densidade | Navegação | Preço |
| :--- | :--- | :--- | :--- | :--- |
| **SaaS B2B** | Operação diária de empresas (Advocacias / Imobiliárias) | Alta clareza, boa densidade, tabelas operacionais, status e workflows | Sidebar + Header | Contextual / Faturamento |
| **Backoffice Cartori** | Execução e conferência interna | Mais densidade, prioridade para fila de pedidos, SLA, pendências e ação | Sidebar operacional | Operacional |
| **B2C Commerce** | Aquisição e compra via Google Ads | Mais comercial, foco em preço, catálogo, formulários e checkout | Marketing + Checkout | Visível e comercial |
| **White-label B2B2C** | Coleta e pagamento pelo cliente final | Marca da organização parceira + estrutura controlada pela Cartori | Fluxo guiado | Definido pelo parceiro |

### O Design System NÃO deve:
* Refatorar a lógica de negócio do B2C.
* Criar um tema independente para cada componente do 21st.dev.
* Substituir clareza por efeitos visuais.
* Transformar todo conteúdo em card.
* Acoplar componentes a dados específicos da Cartori quando puderem ser genéricos.

---

## 02. Princípios de Produto e Direção Visual

| Princípio | Aplicação Prática |
| :--- | :--- |
| **Clareza** | O usuário entende rapidamente onde está, o que está acontecendo e qual é a próxima ação. |
| **Confiança** | A interface comunica segurança para operações jurídicas, documentais e financeiras. |
| **Organização** | Grandes volumes de clientes, solicitações e documentos continuam escaneáveis. |
| **Agilidade** | Ações frequentes ficam visíveis e exigem poucos passos (**IconBar**). |
| **Previsibilidade** | Um padrão aprendido se repete em todo o produto. |
| **Densidade Controlada** | Mais informação útil por viewport, sem sacrificar legibilidade. |

### Personalidade
**LegalTech + FinTech + SaaS B2B.** A Cartori deve parecer uma ferramenta operacional madura e confiável, não um portal governamental e não uma interface experimental.

### O que Evitar:
* Glassmorphism forte, neon, glow e gradientes decorativos.
* Sombras pesadas e excesso de elevação.
* Radius exagerado e botões *pill* como padrão.
* Animações decorativas permanentes.
* Cores semânticas confundidas com cores do logotipo.
* Gráficos genéricos sem utilidade operacional.

---

## 03. Arquitetura do Design System

A arquitetura possui três níveis estruturais:

$$\text{PRIMITIVE TOKEN} \longrightarrow \text{SEMANTIC TOKEN} \longrightarrow \text{COMPONENT}$$

* *Exemplo:* `brand-950` (`#011E37`) $\longrightarrow$ `action-primary` $\longrightarrow$ `Button Primary`.
* *Exemplo:* `neutral-900` (`#142A38`) $\longrightarrow$ `text-primary` $\longrightarrow$ `PageTitle`.

### Taxonomia de Código

| Camada | Localização | Exemplos |
| :--- | :--- | :--- |
| **Foundations** | `globals.css` / `tailwind.config.ts` | Cores, tipografia, spacing, radius, borders, shadows, icons, motion |
| **UI Components** | `src/components/ui/` | Button, Input, Select, Badge, StatusBadge, Table, Dialog, Tabs, Stepper |
| **Layout Components** | `src/components/layout/` | PageContainer, PageHeader, Section, Card (Surface), AppSidebar |
| **Domain Components** | `src/components/cartori/` | RequestStatus, RequestTimeline, EarningSummary, ClientSelector |
| **Patterns** | Rotas e Composições | Operational Dashboard, Request Builder, White-label Request Page |

> **Regra de Dependência:** Componentes de domínio podem depender de componentes UI. Componentes UI não devem depender de conceitos de negócio como `Request`, `Customer` ou `Earning`.

---

## 04. Foundations e Tokens

### 4.1 Brand Palette (Cartori Navy)
Definida centralmente em `src/app/globals.css`:

| Token | HEX | Uso Principal |
| :--- | :--- | :--- |
| `--brand-950` | `#011E37` | **Texto institucional forte, navegação e ação primária (Base Oficial)** |
| `--brand-900` | `#062943` | Superfícies escuras e variações de navegação |
| `--brand-800` | `#0A3856` | Hover / pressed escuro |
| `--brand-700` | `#0B496C` | Ações e ícones de marca |
| `--brand-600` | `#075D86` | Ações secundárias de marca |
| `--brand-500` | `#0876A5` | Destaque e links |
| `--brand-400` | `#2995BC` | Informação visual leve |
| `--brand-300` | `#67B6D2` | Elementos suaves |
| `--brand-200` | `#A5D5E5` | Bordas de seleção |
| `--brand-100` | `#D9EEF5` | Fundos brand |
| `--brand-50` | `#F0F8FB` | Background selecionado e estados suaves (Active state de Sidebar) |

### 4.2 Cores de Identidade (Símbolo da Marca)
* `--accent-cyan`: `#0091BB` (Ciano do símbolo da marca)
* `--accent-blue`: `#0E6098` (Azul secundário do símbolo)
* `--accent-green`: `#74BE59` (Verde de identidade; não é Success por definição)
* `--accent-teal`: `#25AB9F` (Acento secundário)
* `--accent-yellow`: `#E3BF1E` (Amarelo de identidade; não é Warning por definição)

### 4.3 Neutral Palette (90% da Interface Operacional)
* `--neutral-0`: `#FFFFFF` (Surface principal)
* `--neutral-50`: `#F8FAFB` (Page background)
* `--neutral-100`: `#F2F5F7` (Subtle surface / cabeçalhos de tabela)
* `--neutral-200`: `#E5EAEE` (Border default)
* `--neutral-300`: `#D2DADF` (Border strong)
* `--neutral-400`: `#A8B4BD` (Elementos disabled)
* `--neutral-500`: `#788895` (Texto terciário / metadados)
* `--neutral-600`: `#586975` (Texto secundário)
* `--neutral-700`: `#3D4E5A` (Texto normal)
* `--neutral-800`: `#263945` (Texto forte)
* `--neutral-900`: `#142A38` (Heading principal)
* `--neutral-950`: `#081C29` (Contraste máximo)

### 4.4 Semantic Colors (Estados Operacionais)
* **Success:** `#16835A` (Concluído, válido, disponível, assinado ICP-Brasil)
* **Warning:** `#B7791F` (Pendência, espera, atenção, diligência)
* **Error / Destructive:** `#C93C37` (Erro, falha, ação destrutiva, rejeição)
* **Information:** `#2878B5` (Análise, processamento, informação notarial)

### 4.5 Semantic Tokens
* **Background:** `background-page`, `background-surface`, `background-subtle`, `background-hover`, `background-selected`, `background-inverse`.
* **Text:** `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-inverse`, `text-link`.
* **Border:** `border-default`, `border-subtle`, `border-strong`, `border-focus`, `border-error`.
* **Action:** `action-primary`, `action-primary-hover`, `action-secondary`, `action-secondary-hover`, `action-destructive`.
* **Status:** `status-neutral`, `status-info`, `status-success`, `status-warning`, `status-error`.

---

## 05. Tipografia, Espaçamento e Elevação

### 5.1 Tipografia
* **Fonte Recomendada:** `Inter`.
* **Pesos Oficiais:** `400 Regular`, `500 Medium`, `600 SemiBold`.

| Token | Tamanho / Linha | Peso | Uso |
| :--- | :--- | :--- | :--- |
| **Display** | 40px / 48px | 600 SemiBold | Marketing, onboarding e momentos institucionais |
| **Heading 1** | 32px / 40px | 600 SemiBold | Título principal de página |
| **Heading 2** | 24px / 32px | 600 SemiBold | Seções principais |
| **Heading 3** | 20px / 28px | 600 SemiBold | Cards e blocos importantes |
| **Body Large** | 16px / 24px | 400 Regular | Texto destacado |
| **Body** | 14px / 20px | 400 Regular | Texto padrão de aplicação |
| **Label** | 14px / 20px | 500 Medium | Labels de campos e botões |
| **Small** | 12px / 16px | 400 Regular | Metadados, tabelas e apoio |
| **Caption** | 11px / 16px | 500 Medium | Datas, códigos e informação compacta |

### 5.2 Spacing (Grid de 4px)
`space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-5` (20px), `space-6` (24px), `space-8` (32px), `space-10` (40px), `space-12` (48px), `space-16` (64px).

### 5.3 Radius
* `radius-sm` (4px): Pequenos controles, tags e badges.
* `radius-md` (8px): Inputs, selects e buttons (Padrão B2B).
* `radius-lg` (12px): Cards, dropdowns e dialogs.
* `radius-xl` (16px): Superfícies especiais.
* `radius-full` (9999px): Avatar e badges quando necessário.

### 5.4 Borders e Shadows
* **Borda padrão:** `1px`, geralmente `neutral-200`. Preferir espaço, background e borda antes de adicionar sombra.
* **Sombras tonalizadas:**
  * `shadow-xs`: `0 1px 2px rgba(1, 30, 55, 0.05)` (controle levemente elevado)
  * `shadow-sm`: `0 4px 12px rgba(1, 30, 55, 0.08)` (dropdown / popover)
  * `shadow-md`: `0 12px 32px rgba(1, 30, 55, 0.12)` (dialog / modal)

### 5.5 Iconografia e Motion
* **Biblioteca Oficial:** `Lucide React`. Tamanhos: `16px`, `20px` e `24px`. Stroke: `1.5` a `1.75`.
* **Motion Tokens:**
  * `fast` (150ms): Hover e microfeedback.
  * `normal` (200ms): Dropdown, seleção e transições comuns.
  * `slow` (300ms): Drawer, dialog e mudanças de layout.
  * `special` (400–650ms): Apenas interações fluidas justificadas, como **IconBar**.

---

## 06. Acessibilidade e Responsividade

### Acessibilidade Obrigatória (WCAG AA):
* Contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para controles).
* Navegação por teclado em 100% dos elementos.
* `focus-visible` em elementos interativos (`focus-visible:ring-2 focus-visible:ring-brand-500`).
* `aria-label` em ações somente com ícone.
* **Status nunca identificado apenas pela cor** (sempre com texto legível).
* Labels associados a inputs via `htmlFor`/`id`.
* Estados `disabled` e `loading` claros.
* `@media (prefers-reduced-motion: reduce)` integrado globalmente.
* Tooltips automáticos na sidebar recolhida.

### Responsive Foundation:
* **Desktop ($\ge 1024$px):** Page padding `32px`; sidebar aberta $\approx 256$px.
* **Laptop ($768$px – $1023$px):** Page padding `24px`; sidebar $240$–$256$px.
* **Tablet:** Sidebar recolhida ou drawer; grids adaptados.
* **Mobile ($< 768$px):** Page padding `16px`; navegação em Sheet/Drawer; tabelas com ocultação de colunas secundárias ou scroll horizontal suave.

---

## 07. Componentes Base V1

* **Button:** Variants `primary`, `secondary`, `outline`, `ghost`, `destructive`. Altura padrão de 40px (`h-10`), radius 8px (`rounded-md`), Label 14/20 Medium.
* **Input e Select:** Compartilham altura (40px), radius (8px), tipografia e estados. Anatomia: `Label → Control → Helper/Error`.
* **Badge x StatusBadge:**
  * `Badge`: Categórico (ex: *Registro Civil*, *Imóveis*, *B2B*).
  * `StatusBadge`: Operacional com dot indicador e texto obrigatório (ex: *Em análise*, *Concluída*).
* **Table / DataTable:** Alta escaneabilidade, linhas compactas, cabeçalho sutil em `neutral-50`, seleção de linhas, status operacional e menu de ações.
* **Stepper:** Fluxos de etapas (`completed`, `current`, `upcoming`, `error`). Versão horizontal e arquitetura preparada para vertical.
* **Surface (Card):** Componente estrutural simples. Default: `bg-surface`, `border-default`, `radius 12px`, sem sombra. Variantes: `default`, `subtle` e `interactive`.

---

## 08. Componentes Aprovados como Referência

### 8.1 IconBar (Quick Actions / Contextual Toolbar)
* **Comportamento:** `[ícone] → hover/foco → [ícone + Label expandido]`
* **Uso:** Ações contextuais de alta frequência (*Nova solicitação*, *Nova pesquisa*, *Novo cliente*, *Enviar documento*).
* **Tokens:** Migrado para tokens oficiais Cartori com animação fluida e suporte completo a teclado.

### 8.2 AppSidebar
* **Dimensões:** Aberta $\approx 256$px | Fechada $\approx 64$px.
* **Estado Recolhido:** Mantém ícones e ativa tooltips automaticamente.
* **Active State:** `bg-brand-50`, `text-brand-950`, `icon-brand-700/950`, sem sombra permanente e sem bordas chamativas simultâneas.

---

## 09. Patterns do Produto (Diretrizes das Próximas Fases)

### 9.1 Operational Dashboard
O Dashboard não é um painel genérico de analytics. Ele responde: *"O que está acontecendo e o que precisa da minha atenção?"*.
* `PageHeader` + Quick Actions (`IconBar`)
* `MetricCards`: Solicitações ativas, Em processamento, Exigem atenção, Concluídas
* `AttentionPanel` (Diligências e pendências cartoriais)
* `RecentRequestsTable` (Tabela de pedidos recentes com status operacional)
* `DeadlineList` (Prazos de cartório e SLA)
* `EarningSummary` (Extrato e repasses)

### 9.2 Request Builder
Pattern principal para emissão dentro do SaaS. Reutiliza o motor de serviços, localização e formulários com experiência B2B:
$$\text{Cliente} \longrightarrow \text{Contexto} \longrightarrow \text{Serviço} \longrightarrow \text{Localização} \longrightarrow \text{Dados} \longrightarrow \text{Revisão} \longrightarrow \text{Pagamento / Faturamento} \longrightarrow \text{Acompanhamento}$$

### 9.3 White-label Request Page
Página pública enviada pela organização parceira ao cliente final. Permite logotipo, nome, cor principal e contato da organização, mantendo estrutura, tipografia, spacing, acessibilidade e componentes controlados pela Cartori (*Theming controlado sem CSS livre*).

---

## 10. Integração com 21st.dev e Governança

### Regra de Adaptação de Componentes:
$$\text{21st.dev component} + \text{Cartori semantic tokens} + \text{Cartori accessibility} + \text{Cartori interaction rules} = \text{Cartori Component}$$

### Checklist de Adaptação:
1. Remover ou mapear tokens locais conflitantes (`--component-background`, etc.).
2. Adaptar cores aos semantic tokens (`brand-950`, `neutral-200`, `semantic-info`).
3. Normalizar raios (8px para controles, 12px para surfaces) e altura (40px).
4. Substituir iconografia para `lucide-react`.
5. Validar navegação por teclado e `focus-visible`.

### Regra de Localização de Arquivos:
* `/src/components/ui/`: Primitives e componentes genéricos reutilizáveis.
* `/src/components/layout/`: Estrutura de aplicação e páginas.
* `/src/components/cartori/`: Componentes com semântica específica do domínio notarial.

---

## 11. Roadmap Visual do Ecossistema

| Fase | Entrega | Status |
| :--- | :--- | :--- |
| **Fase 1** | Auditar stack e componentes existentes | 🟢 Concluído |
| **Fase 2** | Implementar primitive + semantic tokens | 🟢 Concluído |
| **Fase 3** | Normalizar componentes base (Actions, Forms, Feedback, Data, Overlay) | 🟢 Concluído |
| **Fase 4** | Integrar IconBar e Sidebar foundation | 🟢 Concluído |
| **Fase 5** | Criar Design System Showcase (`/design-system`) | 🟢 Concluído |
| **Fase 6** | Revisar visualmente e congelar V1 | 🟢 Concluído |
| **Fase 7** | Construir App Shell + Operational Dashboard B2B | 🟡 Próxima Etapa |
| **Fase 8** | Construir Request Builder B2B (Multi-itens & Dossiês) | ⚪ Planejado |
| **Fase 9** | Expandir Domain Components e White-label Experience | ⚪ Planejado |

> **Critério de Decisão Absoluto:**  
> $$\text{Clareza} > \text{Consistência} > \text{Legibilidade} > \text{Previsibilidade} > \text{Efeitos Visuais}$$
