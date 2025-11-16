# Gerenciar Prospects

## Visão Geral
Tela de busca avançada com filtros detalhados, seleção múltipla de prospects e ações em lote. Permite ao usuário filtrar, selecionar e executar ações sobre múltiplos prospects de forma eficiente.

## Contrato de Dados

### Filtros de Busca (ListPlacesQuery)
```typescript
interface ListPlacesQuery {
  page?: number;
  pageSize?: number;
  state?: string;
  city?: string;
  hasWebsite?: 'true' | 'false';
  nicheSearched?: string;
  firstMessageSent?: 'true' | 'false';
  googlePrimaryCategoryLike?: string;
}
```

### Resposta da Listagem (ListPlacesResponse)
```typescript
interface ListPlacesResponse {
  items: PlaceItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PlaceItem {
  id: string;
  googlePlaceId: string;
  displayName: string;
  nicheSearched: string;
  googlePrimaryCategory?: string | null;
  websiteUri?: string | null;
  nationalPhoneNumber?: string | null;
  normalizedPhoneE164?: string | null;
  city?: string | null;
  state?: string | null;
  firstMessageSent: boolean;
  firstMessageSentAt?: string | null;
  enrichmentStatus: 'pending' | 'enriched' | 'failed';
  enrichedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Seleção e Ações em Lote
```typescript
interface SelectedProspects {
  selectedItems: PlaceItem[];
}

```

## Conteúdo da Tela

### Cabeçalho
- Título: "Gerenciar Prospects"
- Subtítulo: "Busque, filtre e execute ações em lote nos seus prospects."

### Seção de Filtros
- **Estado**: Input de texto 
- **Cidade**: Input de texto
- **Nicho**: Select populado via `GET /niches`
- **Categoria Google**: Input de texto para busca parcial
- **Possui Website**: Toggle com opções "Sim", "Não", "Todos"
- **Primeira Mensagem Enviada**: Toggle com opções "Sim", "Não", "Todos"
- **Botão "Filtrar"**: Aplica filtros e recarrega a tabela
- **Botão "Limpar"**: Remove todos os filtros aplicados

### Tabela de Resultados
- **Seleção**: Checkbox em cada linha + checkbox "Selecionar todos" no cabeçalho
- **Colunas**:
  - Nome do Negócio (`displayName`)
  - Categoria (`googlePrimaryCategory` ou "-")
  - Cidade/Estado (`city`, `state`)
  - Telefone (`nationalPhoneNumber` ou "-")
  - Website (`websiteUri` ou "-")
  - Primeira Mensagem (`firstMessageSent` com ícones)
- **Paginação**: Controles de navegação entre páginas

### Componente de Seleção
- **Posição**: Fixo na parte inferior da tela quando há itens selecionados
- **Conteúdo**: 
  - Contador: "X prospects selecionados"
  - Botão "Limpar seleção"
  - Botão "Ações" com dropdown de ações disponíveis

### Ações em Lote Disponíveis
- **Editar Lista**: Permite visualizar os itens selecionados em um modal e remover itens
- **Enviar Mensagem**: Inicia fluxo de envio de mensagens para os selecionados - (implementar posteriormente)

## Comportamentos Específicos

### Seleção Múltipla
- Seleção persiste entre páginas durante a sessão
- Checkbox "Selecionar todos" afeta apenas a página atual
- Indicador visual claro de linhas selecionadas

### Paginação e Filtros
- Filtros aplicados mantêm-se ao navegar entre páginas
- Loading states durante aplicação de filtros e mudança de página
- Debounce em inputs de texto para evitar requisições excessivas

### Persistência de Estado
- Gerenciar filtros, seleções e preferências via Context de aplicação (CSR).
- Seleções: mantidas no Context em memória durante a sessão; persistem entre páginas sem gravar em storage.
- Evitar duplicação de estado entre Context e componentes; utilizar hooks do Context para leitura/atualização.

## Estados de UI

### Carregamento
- Skeleton na tabela durante carregamento inicial
- Spinner nos filtros durante aplicação
- Loading state no componente de seleção durante ações em lote

### Erro
- Toast/alert discreto para erros de requisição
- Estado de erro na tabela com botão "Tentar novamente"

### Vazio
- Mensagem informativa quando não há resultados
- Sugestões de ajuste nos filtros
- Ilustração/ícone para melhor UX

## Responsividade

## Integração e Navegação

### Endpoints Utilizados
- `GET /google-busines-scraper/places` - Listagem com filtros
- `GET /niches` - Opções para filtro de nicho
- Endpoints futuros para ações em lote

### Roteamento
- Rota: `/dashboard/gerenciar-prospects`
- Parâmetros de URL refletem filtros aplicados
- Navegação integrada ao layout do dashboard

### Autenticação
- Interceptor HTTP injeta `Authorization: Bearer` automaticamente
- Redirecionamento para login se token inválido

## Checklist de Entrega

### Funcionalidades Core
- [ ] Formulário de filtros com todos os campos especificados
- [ ] Tabela responsiva com paginação
- [ ] Seleção múltipla com persistência entre páginas
- [ ] Componente de ações em lote funcional
- [ ] Integração com endpoint `GET /places`

### Estados e Validações
- [ ] Loading states em todos os componentes
- [ ] Tratamento de erros com feedback adequado
- [ ] Validação de filtros no cliente
- [ ] Estado vazio com mensagens informativas

### UX e Acessibilidade
- [ ] Responsividade em todos os breakpoints
- [ ] Labels acessíveis em todos os inputs

### Performance
- [ ] Debounce em inputs de texto

### Integração
- [ ] Persistência de estado implementada
- [ ] URL reflete filtros aplicados
- [ ] Navegação integrada ao dashboard