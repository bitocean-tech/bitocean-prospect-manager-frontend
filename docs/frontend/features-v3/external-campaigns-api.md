# API de Campanhas - Documentação Completa

## Visão Geral

A API de Campanhas permite criar e gerenciar campanhas de envio de mensagens em massa via WhatsApp. O sistema suporta dois tipos de campanhas:

1. **Campanhas Normais**: Enviam mensagens automaticamente via WhatsApp com intervalos aleatórios entre envios
2. **Campanhas Externas**: Apenas armazenam contatos selecionados para envio por outras plataformas, permitindo marcação manual posterior (Já implementado)

### Funcionalidades Principais

- Criação de campanhas com múltiplos destinatários - (Já implementado)
- Envio automático de mensagens com intervalos aleatórios (campanhas normais) - (Já implementado)
- Rotação aleatória de templates para evitar banimentos - (Já implementado)
- Processamento assíncrono em background - (Já implementado)
- Rastreamento de status individual de cada destinatário - (Já implementado)
- Notificações de conclusão para números especificados - (Já implementado)
- Marcação manual de recipients (para campanhas externas)
- Filtros e paginação em todas as listagens

---

## Endpoints

### 1. POST /campaigns

Cria uma nova campanha (normal ou externa).

#### Request Body

```typescript
interface CreateCampaignDto {
  placeIds: string[];                    // Obrigatório: Array de IDs dos Places
  messageTypeId?: string;                 // Opcional: ID do tipo de mensagem (obrigatório se isExternal = false)
  intervalMin?: number;                   // Opcional: Intervalo mínimo em segundos (obrigatório se isExternal = false)
  intervalMax?: number;                   // Opcional: Intervalo máximo em segundos (obrigatório se isExternal = false)
  name?: string;                          // Opcional: Nome da campanha
  isExternal?: boolean;                   // Opcional: Se true, cria campanha externa (default: false)
  notifyPhones?: string[];                // Opcional: Array de números para notificação de conclusão (formato E.164: +5511...)
}
```

#### Validações

- `placeIds`: Array não vazio, sem duplicatas
- `messageTypeId`: Obrigatório se `isExternal = false`
- `intervalMin` e `intervalMax`: Obrigatórios se `isExternal = false`, devem ser >= 1, `intervalMin` <= `intervalMax`
- `notifyPhones`: Cada número deve estar no formato E.164 (`+5511...`)

#### Response

```typescript
interface CreateCampaignResponse {
  campaignId: string;
  status: 'pending' | 'completed';       // 'completed' para campanhas externas
  totalRecipients: number;
  message: string;
}
```

#### Exemplo de Request (Campanha Normal)

```json
{
  "placeIds": ["clx123abc", "clx456def", "clx789ghi"],
  "messageTypeId": "clx999msg",
  "intervalMin": 30,
  "intervalMax": 120,
  "name": "Campanha de Prospecção - Janeiro 2025",
  "notifyPhones": ["+5511999999999", "+5511888888888"]
}
```

#### Exemplo de Request (Campanha Externa)

```json
{
  "placeIds": ["clx123abc", "clx456def", "clx789ghi"],
  "name": "Contatos para Envio Manual",
  "isExternal": true
}
```

#### Exemplo de Response

```json
{
  "campaignId": "clx111camp",
  "status": "pending",
  "totalRecipients": 3,
  "message": "Campanha criada e processamento iniciado"
}
```

#### Comportamento

- **Campanhas Normais**: (Já implementado)
  - Valida `messageTypeId` e intervalos
  - Filtra Places sem telefone (ignora silenciosamente)
  - Cria campanha com status `pending`
  - Inicia processamento em background (envio assíncrono)
  - Retorna imediatamente com `campaignId`

- **Campanhas Externas**:
  - Não valida `messageTypeId` nem intervalos
  - Filtra Places sem telefone (ignora silenciosamente)
  - Cria campanha com status `completed`
  - Não inicia processamento automático
  - Retorna imediatamente com `campaignId`

---

### 2. GET /campaigns

Lista todas as campanhas com paginação e filtros.

#### Query Parameters

```typescript
interface ListCampaignsDto {
  page?: number;                          // Opcional: Número da página (default: 1)
  pageSize?: number;                       // Opcional: Itens por página (default: 10)
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  search?: string;                        // Opcional: Busca por nome da campanha ou nome do tipo de mensagem
  isExternal?: boolean;                    // Opcional: Filtrar por tipo de campanha
}
```

#### Response

```typescript
interface ListCampaignsResponse {
  items: Campaign[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Campaign {
  id: string;
  name?: string;
  messageTypeId?: string;
  messageType?: {
    id: string;
    name: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  isExternal: boolean;
  intervalMin?: number;
  intervalMax?: number;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  startedAt?: string;                     // ISO 8601
  completedAt?: string;                    // ISO 8601
  createdAt: string;                       // ISO 8601
  updatedAt: string;                       // ISO 8601
}
```

#### Exemplo de Request

```
GET /campaigns?status=in_progress&page=1&pageSize=20&isExternal=false
```

#### Exemplo de Response

```json
{
  "items": [
    {
      "id": "clx111camp",
      "name": "Campanha de Prospecção - Janeiro 2025",
      "messageTypeId": "clx999msg",
      "messageType": {
        "id": "clx999msg",
        "name": "Proposta Clínica de Estética"
      },
      "status": "in_progress",
      "isExternal": false,
      "intervalMin": 30,
      "intervalMax": 120,
      "totalRecipients": 100,
      "successCount": 45,
      "failedCount": 2,
      "pendingCount": 53,
      "startedAt": "2025-01-15T10:30:00.000Z",
      "completedAt": null,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:35:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

---

### 3. GET /campaigns/:id

Retorna os detalhes de uma campanha específica.

#### Path Parameters

- `id`: ID da campanha

#### Response

```typescript
interface Campaign {
  id: string;
  name?: string;
  messageTypeId?: string;
  messageType?: {
    id: string;
    name: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  isExternal: boolean;
  intervalMin?: number;
  intervalMax?: number;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  startedAt?: string;                     // ISO 8601
  completedAt?: string;                    // ISO 8601
  createdAt: string;                       // ISO 8601
  updatedAt: string;                       // ISO 8601
}
```

#### Exemplo de Request

```
GET /campaigns/clx111camp
```

#### Exemplo de Response

```json
{
  "id": "clx111camp",
  "name": "Campanha de Prospecção - Janeiro 2025",
  "messageTypeId": "clx999msg",
  "messageType": {
    "id": "clx999msg",
    "name": "Proposta Clínica de Estética"
  },
  "status": "completed",
  "isExternal": false,
  "intervalMin": 30,
  "intervalMax": 120,
  "totalRecipients": 100,
  "successCount": 95,
  "failedCount": 3,
  "pendingCount": 2,
  "startedAt": "2025-01-15T10:30:00.000Z",
  "completedAt": "2025-01-15T11:45:00.000Z",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T11:45:00.000Z"
}
```

#### Erros

- `404 Not Found`: Campanha não encontrada

---

### 4. GET /campaigns/:id/recipients

Lista os recipients (destinatários) de uma campanha com paginação e filtros.

#### Path Parameters

- `id`: ID da campanha

#### Query Parameters

```typescript
interface ListCampaignRecipientsDto {
  page?: number;                          // Opcional: Número da página (default: 1)
  pageSize?: number;                      // Opcional: Itens por página (default: 10)
  status?: 'pending' | 'sent' | 'failed';
}
```

#### Response

```typescript
interface ListCampaignRecipientsResponse {
  items: CampaignRecipient[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface CampaignRecipient {
  id: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;                        // ISO 8601
  errorMessage?: string;
  templateId?: string;
  place: {
    id: string;
    googlePlaceId: string;
    displayName: string;
    normalizedPhoneE164?: string | null;
    city?: string | null;
    state?: string | null;
    nicheSearched: string;
  };
  template?: {
    id: string;
    title: string;
  };
}
```

#### Exemplo de Request

```
GET /campaigns/clx111camp/recipients?status=sent&page=1&pageSize=50
```

#### Exemplo de Response

```json
{
  "items": [
    {
      "id": "clx222recip",
      "status": "sent",
      "sentAt": "2025-01-15T10:31:15.000Z",
      "errorMessage": null,
      "templateId": "clx333tmpl",
      "place": {
        "id": "clx123abc",
        "googlePlaceId": "ChIJ...",
        "displayName": "Clínica de Estética Beleza Pura",
        "normalizedPhoneE164": "+5511999999999",
        "city": "São Paulo",
        "state": "SP",
        "nicheSearched": "clínica de estética"
      },
      "template": {
        "id": "clx333tmpl",
        "title": "Proposta Clínica - Variação 1"
      }
    }
  ],
  "page": 1,
  "pageSize": 50,
  "total": 95,
  "totalPages": 2
}
```

#### Erros

- `404 Not Found`: Campanha não encontrada

---

### 5. PATCH /campaigns/:id/recipients

Atualiza o status de recipients de uma campanha. Útil para marcar recipients como enviados em campanhas externas ou atualizar status manualmente.

#### Path Parameters

- `id`: ID da campanha

#### Request Body

```typescript
interface UpdateRecipientsDto {
  recipientIds?: string[];                // Opcional: IDs dos recipients a atualizar (whitelist)
  excludeRecipientIds?: string[];          // Opcional: IDs dos recipients a excluir da atualização (blacklist)
  status?: 'pending' | 'sent' | 'failed';  // Opcional: Novo status
  errorMessage?: string;                    // Opcional: Mensagem de erro (pode ser vazia para limpar)
}
```

#### Regras de Seleção

- Se `recipientIds` fornecido: atualiza apenas esses recipients
- Se `excludeRecipientIds` fornecido: atualiza todos exceto esses
- Se ambos vazios/undefined: atualiza todos os recipients da campanha
- **Importante**: Apenas um dos arrays pode ter valores (validação automática)

#### Response

```typescript
interface UpdateRecipientsResponse {
  updatedCount: number;
  message: string;
}
```

#### Exemplo de Request (Marcar específicos como enviados)

```json
{
  "recipientIds": ["clx222recip", "clx333recip"],
  "status": "sent"
}
```

#### Exemplo de Request (Marcar todos exceto alguns)

```json
{
  "excludeRecipientIds": ["clx444recip"],
  "status": "sent"
}
```

#### Exemplo de Request (Marcar todos como enviados)

```json
{
  "status": "sent"
}
```

#### Exemplo de Request (Atualizar status de falha)

```json
{
  "recipientIds": ["clx555recip"],
  "status": "failed",
  "errorMessage": "Número inválido"
}
```

#### Exemplo de Response

```json
{
  "updatedCount": 2,
  "message": "2 recipient(s) atualizado(s)"
}
```

#### Comportamento

- Valida que todos os IDs pertencem à campanha
- Atualiza contadores da campanha automaticamente
- Se `status = 'sent'` e é a primeira mensagem do Place:
  - Atualiza `Place.firstMessageSent = true`
  - Atualiza `Place.firstMessageSentAt = now()`
  - Atualiza `Place.firstCampaignId = campaignId`

#### Erros

- `404 Not Found`: Campanha não encontrada
- `400 Bad Request`: IDs de recipients não pertencem à campanha
- `400 Bad Request`: Ambos `recipientIds` e `excludeRecipientIds` têm valores

---

## Tipos e Enums

### CampaignStatus

```typescript
type CampaignStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
```

- `pending`: Campanha criada, aguardando processamento
- `in_progress`: Campanha em execução (enviando mensagens)
- `completed`: Campanha finalizada com sucesso
- `failed`: Campanha falhou (erro crítico)

### CampaignRecipientStatus

```typescript
type CampaignRecipientStatus = 'pending' | 'sent' | 'failed';
```

- `pending`: Recipient aguardando envio
- `sent`: Mensagem enviada com sucesso
- `failed`: Falha no envio da mensagem

---

## Fluxo de Processamento (Campanhas Normais)

1. **Criação**: Frontend envia `POST /campaigns` com lista de `placeIds`
2. **Validação**: Backend valida dados e filtra Places sem telefone
3. **Criação de Registros**: Cria `Campaign` e `CampaignRecipient` para cada Place válido
4. **Resposta Imediata**: Retorna `campaignId` para o frontend
5. **Processamento em Background**:
   - Atualiza status para `in_progress`
   - Busca templates ativos do `messageTypeId`
   - Para cada recipient pendente:
     - Seleciona template aleatório
     - Envia mensagem via WhatsApp
     - Atualiza status do recipient
     - Atualiza contadores da campanha
     - Se primeira mensagem: atualiza `Place.firstMessageSent`
     - Aguarda intervalo aleatório entre `intervalMin` e `intervalMax`
   - Finaliza campanha (`status = 'completed'`)
   - Envia notificações de conclusão (se `notifyPhones` fornecido)

---

## Fluxo de Campanhas Externas

1. **Criação**: Frontend envia `POST /campaigns` com `isExternal: true`
2. **Validação**: Backend valida apenas `placeIds` (sem `messageTypeId` ou intervalos)
3. **Criação de Registros**: Cria `Campaign` com status `completed` e `CampaignRecipient` com status `pending`
4. **Resposta Imediata**: Retorna `campaignId`
5. **Marcaçao Manual**: Frontend usa `PATCH /campaigns/:id/recipients` para marcar recipients como enviados após envio por outra plataforma

---

## Tratamento de Erros

### Erros Comuns

| Status Code | Descrição |
|------------|-----------|
| `400 Bad Request` | Dados inválidos (validação falhou) |
| `404 Not Found` | Recurso não encontrado (campanha, messageType, etc.) |
| `500 Internal Server Error` | Erro interno do servidor |

### Exemplo de Erro

```json
{
  "statusCode": 400,
  "message": "messageTypeId é obrigatório para campanhas normais",
  "error": "Bad Request"
}
```

---

## Observações Importantes

1. **Filtro de Telefones**: Places sem `normalizedPhoneE164` são automaticamente ignorados (não geram erro)

2. **Processamento Assíncrono**: Campanhas normais processam em background. O frontend deve fazer polling em `GET /campaigns/:id` para acompanhar o progresso

3. **Rotação de Templates**: Cada mensagem usa um template aleatório do `messageTypeId` para evitar banimentos

4. **Intervalos Aleatórios**: O intervalo entre mensagens é aleatório entre `intervalMin` e `intervalMax` segundos

5. **Primeira Mensagem**: Quando um Place recebe sua primeira mensagem com sucesso, os campos `firstMessageSent`, `firstMessageSentAt` e `firstCampaignId` são atualizados automaticamente

6. **Notificações**: Números em `notifyPhones` recebem uma mensagem formatada com os detalhes da campanha ao finalizar (apenas campanhas normais)

7. **Campanhas Externas**: Não enviam mensagens automaticamente. Use `PATCH /campaigns/:id/recipients` para marcar como enviados após envio manual

---

## Exemplos de Integração

### Criar e Monitorar Campanha Normal

```typescript
// 1. Criar campanha
const response = await fetch('/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    placeIds: ['id1', 'id2', 'id3'],
    messageTypeId: 'msgTypeId',
    intervalMin: 30,
    intervalMax: 120,
    name: 'Minha Campanha',
    notifyPhones: ['+5511999999999']
  })
});

const { campaignId } = await response.json();

// 2. Monitorar progresso (polling)
const checkStatus = async () => {
  const res = await fetch(`/campaigns/${campaignId}`);
  const campaign = await res.json();
  
  if (campaign.status === 'completed' || campaign.status === 'failed') {
    console.log('Campanha finalizada!', campaign);
    return;
  }
  
  console.log(`Progresso: ${campaign.successCount}/${campaign.totalRecipients}`);
  setTimeout(checkStatus, 5000); // Verificar a cada 5 segundos
};

checkStatus();
```

### Criar e Marcar Campanha Externa

```typescript
// 1. Criar campanha externa
const response = await fetch('/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    placeIds: ['id1', 'id2', 'id3'],
    name: 'Contatos para Envio Manual',
    isExternal: true
  })
});

const { campaignId } = await response.json();

// 2. Após enviar mensagens manualmente, marcar como enviados
await fetch(`/campaigns/${campaignId}/recipients`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'sent'
  })
});
```

---

## Changelog

### Versão Atual
- Suporte a campanhas normais e externas
- Processamento assíncrono em background
- Rotação aleatória de templates
- Notificações de conclusão
- Marcação manual de recipients
- Filtros e paginação completos

