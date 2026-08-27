# Cartori Design System V1 — Manual Técnico Oficial

Documento mestre de especificações, diretrizes visuais, arquitetura de tokens e governança de componentes da plataforma **Cartori**.

---

## 1. Purpose (Objetivo)

O **Cartori Design System V1** é a camada fundacional de interface e experiência de usuário para o ecossistema de produtos Cartori, com foco prioritário no **SaaS B2B para Empresas, Advocacias e Imobiliárias** e no **Backoffice Operacional Cartorial**.

Sua arquitetura foi concebida para atender à intersecção de:
$$\text{LegalTech} + \text{FinTech} + \text{SaaS B2B Operacional}$$

Garantindo máxima velocidade na manipulação de altos volumes de documentos, pedidos e dados notariais com total segurança e previsibilidade.

---

## 2. Principles (Princípios de Design)

* **Clareza:** A informação crítica (protocolo, status notarial, prazos e valores) é compreendida sem esforço cognitivo.
* **Confiança:** Estética sóbria, elegante e profissional inspirada no rigor jurídico e financeiro, evitando exageros visuais (sem glassmorphism, sem neons, sem sombras pesadas).
* **Organização:** Estrutura modular que mantém telas com centenas de solicitações fáceis de filtrar e escanear.
* **Agilidade:** Fluxos de ações mais frequentes demandam o menor número de cliques e contam com barras de ação rápida (**IconBar**).
* **Previsibilidade:** Padrões uniformes em botões, campos de texto (40px de altura, 8px de raio), menus e tabelas.
* **Densidade Controlada:** Interface operacional compacta com espaçamento balanceado e legibilidade impecável.

---

## 3. Brand (Identidade Institucional)

* **Cor Institucional:** `Cartori Navy` (`#011E37`).
* **Diretório de Ativos Oficiais:** `/public/brand/`
  * `/public/brand/cartori-logo-horizontal.svg`: Versão horizontal oficial para cabeçalhos e relatórios.
  * `/public/brand/cartori-symbol.svg`: Símbolo vetorial para ícones e avatares.
* **Cores Secundárias de Identidade:**
  * Cyan: `#0091BB`
  * Blue: `#0E6098`
  * Green: `#74BE59`
  * Teal: `#25AB9F`
  * Yellow: `#E3BF1E`
  *(Nota: Cores de identidade visual não devem ser confundidas com estados semânticos de erro/sucesso).*

---

## 4. Primitive Tokens

Definidos centralmente como variáveis CSS em `src/app/globals.css`:

```css
/* Brand Navy Scale */
--brand-50:  #F0F8FB;
--brand-100: #D9EEF5;
--brand-200: #A5D5E5;
--brand-300: #67B6D2;
--brand-400: #2995BC;
--brand-500: #0876A5;
--brand-600: #075D86;
--brand-700: #0B496C;
--brand-800: #0A3856;
--brand-900: #062943;
--brand-950: #011E37; /* Base Oficial */

/* Neutral Scale */
--neutral-0:   #FFFFFF;
--neutral-50:  #F8FAFB;
--neutral-100: #F2F5F7;
--neutral-200: #E5EAEE;
--neutral-300: #D2DADF;
--neutral-400: #A8B4BD;
--neutral-500: #788895;
--neutral-600: #586975;
--neutral-700: #3D4E5A;
--neutral-800: #263945;
--neutral-900: #142A38;
--neutral-950: #081C29;
```

---

## 5. Semantic Tokens

Arquitetura em 3 camadas: `Primitive → Semantic → Component`.

| Token Semântico | Valor Referência | Uso Pretendido |
| :--- | :--- | :--- |
| `--bg-page` | `#F8FAFB` (`neutral-50`) | Fundo geral da aplicação |
| `--bg-surface` | `#FFFFFF` (`neutral-0`) | Superfície de cards, modais e tabelas |
| `--bg-subtle` | `#F2F5F7` (`neutral-100`) | Fundo de cabeçalhos de tabela e painéis |
| `--text-primary` | `#142A38` (`neutral-900`) | Títulos e textos principais |
| `--text-secondary` | `#586975` (`neutral-600`) | Subtítulos e rótulos auxiliares |
| `--text-tertiary` | `#788895` (`neutral-500`) | Descrições e metadados |
| `--border-default` | `#E5EAEE` (`neutral-200`) | Bordas estruturais padrão |
| `--action-primary` | `#011E37` (`brand-950`) | Botões e ações principais |

---

## 6. Typography (Tipografia)

* **Família Oficial:** `Inter` (com fallbacks `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto`).
* **Pesos Oficiais:** `400 Regular`, `500 Medium`, `600 SemiBold`.

| Estilo | Tamanho / Line Height | Peso | Uso |
| :--- | :--- | :--- | :--- |
| **Display** | 40px / 48px | 600 SemiBold | Destaques de impacto |
| **Heading 1** | 32px / 40px | 600 SemiBold | Título de página principal |
| **Heading 2** | 24px / 32px | 600 SemiBold | Título de seção / modal |
| **Heading 3** | 20px / 28px | 600 SemiBold | Subseções e cabeçalhos |
| **Body Large** | 16px / 24px | 400 Regular | Textos introdutórios |
| **Body** | 14px / 20px | 400 Regular | Texto padrão da aplicação |
| **Label** | 14px / 20px | 500 Medium | Rótulos de formulários e botões |
| **Small** | 12px / 16px | 400 Regular | Tabelas e notas auxiliares |
| **Caption** | 11px / 16px | 500 Medium | Badges e micro-informações |

---

## 7. Spacing (Grid de Espaçamento)

Base aritmética de **4px**:
* `--space-1`: 4px
* `--space-2`: 8px
* `--space-3`: 12px
* `--space-4`: 16px
* `--space-5`: 20px
* `--space-6`: 24px
* `--space-8`: 32px
* `--space-10`: 40px
* `--space-12`: 48px
* `--space-16`: 64px

---

## 8. Radius (Raios de Arredondamento)

* `--radius-sm` (4px): Pequenos controles, tags e badges.
* `--radius-md` (8px): Inputs, selects e botões (Padrão B2B).
* `--radius-lg` (12px): Cards, tabelas, dropdowns e dialogs.
* `--radius-xl` (16px): Superfícies de destaque.
* `--radius-full` (9999px): Avatares e indicadores de status.

---

## 9. Borders (Bordas)

* Espessura padrão: **1px**.
* Cores de estado:
  * *Default:* `var(--neutral-200)` (`#E5EAEE`)
  * *Hover:* `var(--neutral-400)` (`#A8B4BD`)
  * *Focus:* `var(--brand-500)` (`#0876A5`) com anel sutil `ring-2`
  * *Error:* `var(--semantic-error)` (`#C93C37`)

---

## 10. Shadows (Elevação)

Sombras tonalizadas com Cartori Navy (`rgba(1, 30, 55, ...)`):
* `--shadow-xs`: `0 1px 2px rgba(1, 30, 55, 0.05)` (botões e controles)
* `--shadow-sm`: `0 4px 12px rgba(1, 30, 55, 0.08)` (dropdowns, popovers, icon bar)
* `--shadow-md`: `0 12px 32px rgba(1, 30, 55, 0.12)` (dialogs e sheets)

---

## 11. Icons (Iconografia)

* **Biblioteca Exclusiva:** `Lucide React`.
* **Tamanhos Padrão:** `14px` (xs/inline), `16px` (sm/botões), `20px` (md/seções), `24px` (lg).
* **Stroke:** `1.5` a `1.75`.

---

## 12. Motion (Animações e Transições)

* `--motion-fast` (150ms): Hover de botões, checkboxes, menus simples.
* `--motion-normal` (200ms): Abertura de dropdowns, expansão do IconBar, transição de abas.
* `--motion-slow` (300ms): Abertura de drawers laterais (Sheet) e modais.
* **Acessibilidade:** Suporte nativo a `@media (prefers-reduced-motion: reduce)` no `globals.css`.

---

## 13. Components Catalog (Biblioteca V1)

### Actions
* `Button`: Variantes `primary`, `secondary`, `outline`, `ghost`, `destructive`; Tamanhos `sm`, `md` (40px), `lg`, `icon`.
* `IconButton`: Controle quadrado com `aria-label` obrigatório para acessibilidade.

### Forms
* `Input`: Altura de 40px, 8px de raio, suporte a ícone esquerdo/direito, label e mensagem de erro estruturada.
* `Textarea`: Linguagem visual equivalente ao Input.
* `Select`: Seleção com chevron e validação de erro.
* `Checkbox`: Controle acessível com indicador visual nítido.
* `RadioGroup`: Agrupamento de opções exclusivas com suporte a título e descrição.
* `Switch`: Toggle switch para configurações operacionais.

### Feedback
* `Badge`: Uso puramente categórico (Registro Civil, Imóveis, B2B).
* `StatusBadge`: Uso estritamente operacional com dot indicador e texto obrigatório.
* `Alert`: Avisos contextuais (Info, Success, Warning, Error) com ícone temático e botão de fechar opcional.
* `Skeleton` & `Spinner`: Estados de carregamento acessíveis.

### Navigation
* `Tabs`: Abas com variantes `underline` (padrão) e `pill` (agrupamentos).
* `Breadcrumb`: Trilha de navegação semântica.

### Overlays
* `Dialog`: Modal centralizado com 12px de raio, sombra média e bloqueio de scroll.
* `Sheet`: Painel lateral (Drawer) deslizante para filtros e detalhes rápidos.
* `DropdownMenu`: Menu flutuante de ações com atalhos de teclado e itens destrutivos.
* `Popover` & `Tooltip`: Elementos flutuantes informativos.

### Data
* `Table`: Tabela densa com cabeçalho sutil, suporte a seleção de linhas e ações por linha.
* `Pagination`: Navegação de páginas com contagem total de registros.

### Workflow & Utilities
* `Stepper`: Etapas de fluxo de trabalho (completed, current, upcoming, error).
* `IconBar`: Barra de ações rápidas contextuais (Quick Actions) com expansão horizontal no hover/foco.

### Layout
* `PageContainer`: Espaçamentos responsivos (32px desktop, 24px laptop, 16px mobile).
* `PageHeader`: Cabeçalho padrão de página com título, descrição, badges e ações.
* `Section`: Separador de blocos lógicos.
* `Card` (`Surface`): Variantes `default`, `subtle`, `interactive`.
* `AppSidebar`: Barra lateral fundacional (256px aberta, 64px recolhida com tooltips).

---

## 14. Status Semantics (Semântica Operacional)

A plataforma utiliza 5 categorias de status obrigatórias:

| Status | Cor Semântica | Exemplos de Aplicação no Domínio |
| :--- | :--- | :--- |
| **Neutral** | Cinza Neutro (`neutral-700`) | Solicitada, Aguardando Início, Cancelada |
| **Info** | Azul Notarial (`semantic-info`) | Em Análise, Em Processamento no Cartório |
| **Warning** | Âmbar Notarial (`semantic-warning`) | Aguardando Documento, Com Pendência, Em Diligência |
| **Success** | Verde Confirmação (`semantic-success`) | Certidão Concluída, Assinada ICP-Brasil, Paga |
| **Error** | Vermelho Alerta (`semantic-error`) | Rejeitada pelo Cartório, Erro no Assento, Estornada |

> [!IMPORTANT]
> **Regra de Acessibilidade de Status:** Nenhum status pode ser transmitido apenas por cor. Todos os `StatusBadge` exigem texto explícito.

---

## 15. Accessibility (Acessibilidade WCAG AA)

1. **Navegação por Teclado:** Todos os componentes interativos contam com anel de foco visível `focus-visible:ring-2 focus-visible:ring-brand-500`.
2. **Atributos ARIA:** `aria-label`, `aria-expanded`, `aria-describedby`, `aria-selected`, `aria-busy` e `role` em todos os componentes.
3. **Contraste de Cor:** Proporção mínima de contraste de 4.5:1 para textos comuns e 3:1 para elementos de controle.
4. **Fechamento por Teclado:** Modais (`Dialog`) e gavetas (`Sheet`) fecham automaticamente com a tecla `Escape`.

---

## 16. Responsive Behavior (Comportamento Responsivo)

* **Desktop ($\ge 1024$px):** Padding horizontal de 32px, tabelas completas, Sidebar expandida por padrão.
* **Laptop / Tablet ($768$px – $1023$px):** Padding horizontal de 24px, tabelas com scroll horizontal suave.
* **Mobile ($< 768$px):** Padding horizontal de 16px, botões e tabelas adaptados para toque, Sheet para navegação.

---

## 17. 21st.dev Integration Rules (Regras de Integração)

Quando um novo componente for selecionado a partir do repositório `21st.dev`:
1. **Eliminar tokens estrangeiros:** Variáveis como `--component-background`, `--ic-primary` ou classes arbitrárias de cores devem ser estritamente substituídas pelos tokens Cartori (`brand-950`, `neutral-200`, etc.).
2. **Harmonizar Raios e Alturas:** Forçar `h-10` e `rounded-md` em inputs/botões e `rounded-lg` em superfícies.
3. **Substituir Ícones:** Manter unicamente a biblioteca `lucide-react`.
4. **Adicionar Acessibilidade:** Garantir `focus-visible`, suporte a teclado e `prefers-reduced-motion`.

---

## 18. Component Contribution Rules (Governança)

Antes de criar um novo componente:
1. **Verificação de Equivalência:** Já existe um componente na biblioteca que resolve a necessidade?
2. **Uso de Variantes:** O caso de uso pode ser atendido adicionando uma `variant` ou `size` a um componente existente?
3. **Separação de Camadas:**
   * `/src/components/ui/` $\rightarrow$ Componentes puramente visuais e genéricos (ex: `Button`, `Input`, `Table`).
   * `/src/components/cartori/` $\rightarrow$ Componentes acoplados a regras de negócio e dados notariais futuros (ex: `ProtocolBadge`, `CartorioCard`, `DossierViewer`).
4. **Validação:** Qualquer novo componente deve ser exposto e validado na rota interna `/design-system`.
