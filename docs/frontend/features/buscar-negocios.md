# Buscar Negócios — Especificação de Implementação

Propósito: permitir que o usuário pesquise negócios por termo e nicho, visualizar um relatório com estatísticas da busca e listar os itens encontrados de forma organizada.

## Objetivo
- Viabilizar pesquisa por termo e nicho.
- Exibir relatório quantitativo da busca.
- Apresentar listagem de itens encontrados com informações essenciais.

## Requisitos Funcionais
- Carregar nichos do backend para popular o select de nicho.
- Formulário com dois campos: termo de busca (texto) e nicho (select), além do botão “Buscar”.
- Ao acionar “Buscar”, enviar requisição para realizar a busca.
- Exibir relatório com os totais retornados.
- Listar itens encontrados em formato tabular com colunas essenciais.
- Exibir tag “novo” para itens novidades desta busca.
- Cobrir estados de carregamento, erro e vazio.
- Garantir responsividade em todas as seções.

## Endpoints
- `GET /niches`
  - Objetivo: recuperar lista de nichos para o select.
  - Autenticação: `Authorization: Bearer <ACCESS_KEY>`.
- `POST /google-busines-scraper/search`
  - Objetivo: executar a busca.
  - Corpo: `{ query: string, niche: string }`.
  - Autenticação: `Authorization: Bearer <ACCESS_KEY>`.

## Contratos de Dados
As seguintes interfaces definem o contrato que o frontend deve seguir à risca. Todos os campos e formatos devem ser respeitados exatamente como descritos.

```ts
export interface Niche {
  id: string;
  displayName: string;
  standardizedName: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type EnrichmentStatus = 'enriched' | 'failed' | 'pending';

export interface ReportItem {
  googlePlaceId: string;
  displayName: string;
  nicheSearched: string;
  googlePrimaryCategory?: string;
  websiteUri?: string;
  normalizedPhoneE164?: string;
  city?: string;
  state?: string;
  enrichmentStatus: EnrichmentStatus;
}

export interface SearchResponse {
  totalFetched: number;
  newSavedCount: number;
  alreadyExistingCount: number;
  enrichedCount: number;
  failedCount: number;
  pendingCount: number;
  items: ReportItem[];
}
```

Observação: o frontend não deve redefinir esses tipos localmente; deve consumir e exibir os dados exatamente conforme o contrato acima.

## Conteúdo da Tela
- Título: “Buscar negócios”.
- Subtítulo: “Pesquise negócios por termo e nicho e visualize o relatório da busca.”
- Inputs:
  - Termo de busca (texto, com label acessível).
  - Nicho (select, populado via `GET /niches`).
  - Ambos os campos são obrigatórios; validação no cliente impede submissão quando vazios/inválidos.
  - Mensagens de erro discretas e acessíveis devem aparecer próximas aos inputs quando inválidos.
- Ação:
  - Botão “Buscar” (desabilitado quando inválido ou em carregamento).
- Resultado:
  - Cards minimalistas com números do `SearchResponse`.
  - Tabela dos itens (`items` de `SearchResponse`).

## Cards de Métricas
- Exibir os contadores: `totalFetched`, `newSavedCount`, `alreadyExistingCount`, `enrichedCount`, `failedCount`, `pendingCount`.
- Usar ícones Lucide nos cards (visual leve e consistente).
- Tipografia e espaçamento minimalistas, alinhados ao tema atual, responsivos em diferentes breakpoints.

## Tabela de Resultados
- Colunas: Nome (`displayName`), Categoria (`googlePrimaryCategory` ou “-” quando ausente), Status (tag “novo”).
- Chave de linha: `googlePlaceId`.
- Rolagem horizontal (`overflow-x`) quando necessário.

## Estados de UI
- Carregamento: skeletons para inputs/cards/tabela.
- Erro: indicador discreto (alerta) com mensagem de falha.
- Vazio: quando não houver resultados, omitir tabela com mensagem informativa “Nenhum resultado encontrado.”. Os cards de métricas continuam visíveis.

## Responsividade
- Layout em grid, adaptando de 1 a múltiplas colunas em breakpoints médios.
- Tabela com rolagem horizontal em telas pequenas.
- Espaçamentos e tipografia ajustados para mobile-first.

## Integração e Navegação
- Tela acessível dentro do layout autenticado do dashboard.
- Usar o roteamento existente para `/dashboard/buscar-negocios`.

## Checklist de Entrega
- Select de nicho populado via `GET /niches` com autenticação.
- Ação “Buscar” dispara `POST /google-busines-scraper/search` com `{ query, niche }`.
- Cards exibem os seis contadores do `SearchResponse`.
- Tabela lista `items` com Nome, Categoria e tag “novo”.
- Estados de carregamento/erro/vazio cobertos.
- Responsividade aplicada em inputs, cards e tabela.
- Interceptor injeta `Authorization: Bearer` em todas as requisições.