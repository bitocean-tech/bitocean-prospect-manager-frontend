# Endpoint: Obter Telefones de Campanha

## Visão Geral

Este endpoint retorna os números de telefone dos contatos relacionados a uma campanha em dois formatos diferentes: com e sem o prefixo `+` (formato E.164).

---

## Endpoint

### `POST /campaigns/:id/phones`

Retorna os números de telefone dos recipients de uma campanha.

#### Path Parameters

- `id` (string, obrigatório): ID da campanha

#### Request Body

```typescript
interface GetCampaignPhonesDto {
  recipientIds?: string[];  // Opcional: Array de IDs dos recipients
}
```

**Comportamento:**
- Se `recipientIds` estiver vazio, `undefined` ou não fornecido: retorna todos os telefones dos Places relacionados à campanha
- Se `recipientIds` tiver valores: retorna apenas os telefones dos recipients especificados

#### Response

```typescript
interface GetCampaignPhonesResponse {
  phonesE164: string[];           // Array com números no formato E.164 (+5511932117880)
  phonesWithoutPlus: string[];     // Array com números sem o prefixo + (5511932117880)
}
```

---

## Exemplos

### Exemplo 1: Obter todos os telefones da campanha

**Request:**
```http
POST /campaigns/clx111camp/phones
Content-Type: application/json

{}
```

**Response:**
```json
{
  "phonesE164": [
    "+5511999999999",
    "+5511888888888",
    "+5511777777777"
  ],
  "phonesWithoutPlus": [
    "5511999999999",
    "5511888888888",
    "5511777777777"
  ]
}
```

### Exemplo 2: Obter telefones de recipients específicos

**Request:**
```http
POST /campaigns/clx111camp/phones
Content-Type: application/json

{
  "recipientIds": ["clx222recip", "clx333recip"]
}
```

**Response:**
```json
{
  "phonesE164": [
    "+5511999999999",
    "+5511888888888"
  ],
  "phonesWithoutPlus": [
    "5511999999999",
    "5511888888888"
  ]
}
```

### Exemplo 3: Request com array vazio (retorna todos)

**Request:**
```http
POST /campaigns/clx111camp/phones
Content-Type: application/json

{
  "recipientIds": []
}
```

**Response:**
```json
{
  "phonesE164": [
    "+5511999999999",
    "+5511888888888",
    "+5511777777777"
  ],
  "phonesWithoutPlus": [
    "5511999999999",
    "5511888888888",
    "5511777777777"
  ]
}
```

---

## Validações

### Validações de Request

- `recipientIds` (se fornecido):
  - Deve ser um array
  - Cada item deve ser uma string
  - Não pode ter valores duplicados
  - Todos os IDs devem pertencer à campanha especificada

### Comportamento

- Places sem `normalizedPhoneE164` são automaticamente ignorados (não aparecem no resultado)
- Se um recipient não tiver um Place com telefone válido, ele não será incluído no resultado
- Os números são sempre retornados no formato E.164 (com `+`) no array `phonesE164`
- Os números sem o prefixo `+` são retornados no array `phonesWithoutPlus`

---

## Códigos de Erro

### 400 Bad Request

**Causa:** Algum ID de recipient não pertence à campanha especificada

**Response:**
```json
{
  "statusCode": 400,
  "message": "Alguns IDs de recipients não pertencem a esta campanha",
  "error": "Bad Request"
}
```

### 404 Not Found

**Causa:** Campanha não encontrada

**Response:**
```json
{
  "statusCode": 404,
  "message": "Campanha não encontrada",
  "error": "Not Found"
}
```

---

## Casos de Uso

### 1. Copiar todos os números para envio externo

```typescript
// Obter todos os telefones
const response = await fetch('/campaigns/clx111camp/phones', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

const { phonesE164, phonesWithoutPlus } = await response.json();

// Usar phonesE164 para WhatsApp (formato E.164)
// Usar phonesWithoutPlus para outras plataformas
```

### 2. Copiar números de recipients específicos

```typescript
// Obter telefones de recipients selecionados
const response = await fetch('/campaigns/clx111camp/phones', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientIds: ['id1', 'id2', 'id3']
  })
});

const { phonesE164 } = await response.json();
// Copiar para área de transferência ou exportar
```

---

## Observações Importantes

1. **Formato dos Números:**
   - `phonesE164`: Sempre inclui o prefixo `+` (ex: `+5511999999999`)
   - `phonesWithoutPlus`: Sempre sem o prefixo `+` (ex: `5511999999999`)

2. **Filtro Automático:**
   - Apenas Places com `normalizedPhoneE164` válido são incluídos
   - Recipients sem telefone são silenciosamente ignorados

3. **Validação de IDs:**
   - Se `recipientIds` for fornecido, todos os IDs devem existir e pertencer à campanha
   - Se algum ID for inválido, a requisição retorna erro 400

4. **Ordem dos Resultados:**
   - A ordem dos telefones nos arrays corresponde à ordem dos recipients encontrados no banco
   - Não há garantia de ordem específica

---

## Tipos TypeScript

```typescript
// Request DTO
interface GetCampaignPhonesDto {
  recipientIds?: string[];
}

// Response
interface GetCampaignPhonesResponse {
  phonesE164: string[];
  phonesWithoutPlus: string[];
}
```

---

## Integração Frontend

### Exemplo de Hook React

```typescript
import { useState } from 'react';

interface UseCampaignPhonesResult {
  phonesE164: string[];
  phonesWithoutPlus: string[];
  loading: boolean;
  error: string | null;
  fetchPhones: (campaignId: string, recipientIds?: string[]) => Promise<void>;
}

export function useCampaignPhones(): UseCampaignPhonesResult {
  const [phonesE164, setPhonesE164] = useState<string[]>([]);
  const [phonesWithoutPlus, setPhonesWithoutPlus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhones = async (
    campaignId: string,
    recipientIds?: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/campaigns/${campaignId}/phones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar telefones');
      }

      const data = await response.json();
      setPhonesE164(data.phonesE164);
      setPhonesWithoutPlus(data.phonesWithoutPlus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return {
    phonesE164,
    phonesWithoutPlus,
    loading,
    error,
    fetchPhones,
  };
}
```

### Exemplo de Uso

```typescript
function CampaignPhonesComponent({ campaignId }: { campaignId: string }) {
  const { phonesE164, phonesWithoutPlus, loading, error, fetchPhones } =
    useCampaignPhones();

  const handleCopyAll = async () => {
    await fetchPhones(campaignId);
    // Copiar phonesE164.join('\n') para área de transferência
  };

  const handleCopySelected = async (recipientIds: string[]) => {
    await fetchPhones(campaignId, recipientIds);
    // Copiar phonesE164.join('\n') para área de transferência
  };

  return (
    <div>
      <button onClick={handleCopyAll} disabled={loading}>
        Copiar Todos os Telefones
      </button>
      {phonesE164.length > 0 && (
        <div>
          <p>Telefones encontrados: {phonesE164.length}</p>
          <textarea
            value={phonesE164.join('\n')}
            readOnly
            rows={10}
          />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

---

## Changelog

### Versão Atual
- Endpoint criado para retornar telefones de campanhas
- Suporte a filtro por recipientIds
- Retorno em dois formatos (com e sem prefixo +)
- Validação de IDs de recipients
- Filtro automático de Places sem telefone

