## Campanhas — API Backend

Este documento descreve os endpoints, DTOs e objetos de resposta relacionados ao fluxo de campanhas de envio em massa via WhatsApp.

### Autenticação
- Todas as rotas exigem chave de acesso via um dos headers:
  - `Authorization: Bearer <ACCESS_KEY>`
  - ou `x-api-key: <ACCESS_KEY>`

### Notas importantes
- O envio é processado em background após a criação da campanha (o endpoint retorna imediatamente).
- Telefones são enviados para o WhatsApp no formato `5511XXXXXXXX@c.us`. O backend já formata números com `+` automaticamente.
- Destinatários (Places) sem telefone são ignorados na criação da campanha.
- A campanha registra contadores de sucesso/falha/pendente e destinatários com status individual.

---

## POST /campaigns
Cria uma campanha e inicia o envio em segundo plano.

### Body (CreateCampaignDto)
```json
{
  "placeIds": ["<placeId-1>", "<placeId-2>"],
  "messageTypeId": "<messageTypeId>",
  "intervalMin": 30,
  "intervalMax": 120,
  "name": "Campanha opcional"
}
```

- `placeIds` (string[]): IDs de Places existentes (apenas os com `normalizedPhoneE164` serão considerados).
- `messageTypeId` (string): ID de `MessageType` (tipos/agrupadores de templates).
- `intervalMin` / `intervalMax` (number): intervalo aleatório em segundos entre envios.
- `name` (string, opcional): rótulo da campanha.

Validações principais:
- `placeIds` não-vazio; `messageTypeId` existente e ativo.
- `intervalMin >= 1`, `intervalMax >= 1` e `intervalMin <= intervalMax`.
- Pelo menos um destinatário com telefone válido.

### Resposta (201 / 200)
```json
{
  "campaignId": "clcampaign123",
  "status": "pending",
  "totalRecipients": 25,
  "message": "Campanha criada e processamento iniciado"
}
```

---

## GET /campaigns
Lista campanhas com filtros e paginação.

### Query (ListCampaignsDto)
- `page` (number, default 1)
- `pageSize` (number, default 10)
- `status` (string enum: `pending` | `in_progress` | `completed` | `failed`)
- `search` (string) — busca por `name` ou `messageType.name`

Exemplo:
```
GET /campaigns?page=1&pageSize=10&status=in_progress&search=clinicas
```

### Resposta (ListCampaignsResponse)
```json
{
  "items": [
    {
      "id": "clcampaign123",
      "name": "Campanha Clínicas SP",
      "messageTypeId": "clmsgtype123",
      "messageType": { "id": "clmsgtype123", "name": "Proposta Clínicas" },
      "status": "in_progress",
      "intervalMin": 30,
      "intervalMax": 120,
      "totalRecipients": 25,
      "successCount": 8,
      "failedCount": 2,
      "pendingCount": 15,
      "startedAt": "2025-11-15T14:10:32.123Z",
      "completedAt": null,
      "createdAt": "2025-11-15T14:09:58.001Z",
      "updatedAt": "2025-11-15T14:12:01.447Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "totalPages": 1
}
```

---

## GET /campaigns/:id
Retorna detalhes de uma campanha.

### Resposta (Campaign)
```json
{
  "id": "clcampaign123",
  "name": "Campanha Clínicas SP",
  "messageTypeId": "clmsgtype123",
  "messageType": { "id": "clmsgtype123", "name": "Proposta Clínicas" },
  "status": "in_progress",
  "intervalMin": 30,
  "intervalMax": 120,
  "totalRecipients": 25,
  "successCount": 8,
  "failedCount": 2,
  "pendingCount": 15,
  "startedAt": "2025-11-15T14:10:32.123Z",
  "completedAt": null,
  "createdAt": "2025-11-15T14:09:58.001Z",
  "updatedAt": "2025-11-15T14:12:01.447Z"
}
```

Erros:
- 404 quando a campanha não é encontrada.

---

## GET /campaigns/:id/recipients
Lista os destinatários de uma campanha com status individual, paginação e filtro por status.

### Query (ListCampaignRecipientsDto)
- `page` (number, default 1)
- `pageSize` (number, default 10)
- `status` (string enum: `pending` | `sent` | `failed`)

Exemplo:
```
GET /campaigns/clcampaign123/recipients?status=sent&page=1&pageSize=10
```

### Resposta (ListCampaignRecipientsResponse)
```json
{
  "items": [
    {
      "id": "clrecp123",
      "status": "sent",
      "sentAt": "2025-11-15T15:05:12.345Z",
      "errorMessage": null,
      "templateId": "cltmpl999",
      "place": {
        "id": "clplace123",
        "googlePlaceId": "places/ACNf...",
        "displayName": "Clínica Bela",
        "normalizedPhoneE164": "+5511999999999",
        "city": "São Paulo",
        "state": "SP",
        "nicheSearched": "CLINICA_ESTETICA"
      },
      "template": {
        "id": "cltmpl999",
        "title": "Variação 1 - Tom casual"
      }
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 15,
  "totalPages": 2
}
```

Erros:
- 404 quando a campanha não é encontrada.

---

## Modelos e Relacionamentos (visão geral)

- `MessageType` 1—N `Template` (grupo de variações de mensagem).
- `Campaign` referencia um `MessageType` e possui N `CampaignRecipient`.
- `CampaignRecipient` referencia um `Place` (destinatário) e o `Template` escolhido.

Principais campos de `Campaign`:
- `status`: `pending` | `in_progress` | `completed` | `failed`
- `intervalMin`, `intervalMax` — intervalo aleatório entre envios (segundos)
- `totalRecipients`, `successCount`, `failedCount`, `pendingCount`
- `startedAt`, `completedAt`

Principais campos de `CampaignRecipient`:
- `status`: `pending` | `sent` | `failed`
- `sentAt`, `errorMessage`, `templateId`
- `place` (dados essenciais do destinatário)

---

## Observações para o Frontend

- Criação: usar `POST /campaigns` com `placeIds`, `messageTypeId`, `intervalMin`, `intervalMax` e `name` opcional.
- Acompanhamento: usar polling em `GET /campaigns/:id` para progresso (contadores) e `GET /campaigns/:id/recipients` para detalhamento de cada envio.
- Listagem: `GET /campaigns` com filtros de `status` e `search` (por `name` e por `messageType.name`).
- Para envio aleatório de templates, basta informar o `messageTypeId` na criação; o backend seleciona aleatoriamente entre templates ativos.


