# Especificações de Frontend

## Princípios Gerais
- Priorizar baixa complexidade e baixa verbosidade em todo o código.
- Minimizar classes utilitárias do Tailwind em elementos; preferir composição via componentes reutilizáveis e variantes.
- Seguir convenções claras de nomeação, separação de responsabilidades e componentização.
- Priorizar execução client-side (CSR) para UI e data fetching.
- Realizar requisições sempre no cliente, sem cache do lado do servidor.
- Para dados dinâmicos/autenticados, não utilizar revalidação ou cache em camada de servidor.

## Stack e Bibliotecas
- Data fetching e cache: TanStack Query (React Query).
- Estilização: Tailwind CSS.
- Componentes UI: shadcn/ui.
- HTTP Client: Axios.
- Ícones: Lucide

## Estrutura de Pastas
```
src/
  common/
    components/   # componentes compartilhados
    services/     # serviços compartilhados
    interfaces/   # tipos compartilhados entre módulos
    helpers/      # funções auxiliares genéricas
    utils/        # objetos/constantes utilitários
  modules/
    auth/
      pages/      # telas de autenticação (ex.: ValidateKeyPage)
      services/   # métodos de requisição do módulo (ex.: validateKey)
      interfaces/ # tipos específicos do módulo
    prospectFinder/
      pages/      # telas do prospect finder
      services/   # métodos de requisição
      interfaces/ # tipos específicos do módulo
  routes/
    index.tsx     # mapeia rotas -> páginas dos módulos, sem lógica de UI
```

- A pasta de roteamento do Next (`src/app`) deve conter apenas a estrutura de rotas e layouts, importando páginas de `src/modules/*/pages`.
- Cada módulo em `src/modules/*` deve conter as pastas: `pages/`, `services/`, `interfaces/`.
- Itens compartilhados entre módulos ficam em `src/common/*`.

## Convensões de Código
- Componentes pequenos e focados; segregar em subcomponentes para reuso.
- Evitar lógica pesada em componentes; mover para hooks/serviços.
- Preferir composição de componentes shadcn com Tailwind minimalista.
- Nomes de arquivos e pastas em `kebab-case`; componentes em `PascalCase`.
- Funções auxiliares em `common/helpers`; objetos/constantes em `common/utils`.

## Serviços HTTP (Axios + TanStack Query)
- Criar `src/common/services/apiClient.ts` com baseURL e cabeçalhos (`x-api-key`).
- Sempre usar TanStack Query para requisições e cache locais.
- Exemplo de serviço de módulo:

## Padrões de UI (shadcn + Tailwind)
- Usar componentes shadcn para elementos básicos
- Tailwind com classes essenciais e curtas; extrair variantes para componentes compartilhados.
- Estados padrão de carregamento/erro/empty usando componentes reutilizáveis em `common/components`.

## Interfaces e Tipos
- Tipos globais (ex.: PlaceDTO, Template, Niche) ficam em `src/common/interfaces`.
- Tipos específicos de módulo (ex.: SearchRequest, ListPlacesQuery, EnrichResponse) ficam em `src/modules/*/interfaces`.

## Consistência e Ferramentas
- Centralizar autenticação via header `Authorization: Bearer <ACCESS_KEY>` no `apiClient`.

## Boas Práticas de Estado
- Persistir a chave de acesso em cookies seguros com opt-in do usuário (`secure`, `sameSite: 'strict'`, `path: '/'`, `httpOnly: false`).
- Paginação controlada usando os parâmetros do backend (`page`, `pageSize`).

## Erros e Feedback
- Padronizar toasts/alerts para erros HTTP e validações.
- Exibir detalhes mínimos necessários para não poluir a UI.

## 🎨 Diretrizes de UI
- **Minimalismo**: Exibir apenas informações essenciais.
- **Consistência**: Usar componentes shadcn/ui padronizados.
- **Responsividade**: Mobile-first com Tailwind.
- **Acessibilidade**: Seguir padrões WCAG.
- **Temas**: Projeto deve iniciar estruturado com tema claro e escuro, padrão é dark mode.