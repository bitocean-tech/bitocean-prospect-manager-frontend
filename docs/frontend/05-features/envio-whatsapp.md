# Envio de Mensagens via WhatsApp

## Visão Geral
- Rota: `/dashboard/gerenciar-prospects/envio-whatsapp`
- Objetivo: permitir envio em lote de mensagens WhatsApp para os contatos selecionados previamente na tela "Gerenciar Prospects".
- Pré-condição: a seleção de contatos está disponível no Contexto da aplicação (módulo Prospects) e contém ao menos 1 item.

## Conteúdo da Tela
- Card superior com contador de selecionados: exibe `N contatos selecionados` (N > 0).
- Select de modelos: carregado via endpoint de Templates; ao escolher um template, o texto é preenchido no input abaixo.
- Input de texto editável: pré-preenchido com o conteúdo do template selecionado; aceita `\n` para quebras de linha como no WhatsApp.
- Botão "Enviar": abre modal de confirmação antes de iniciar o envio em lote.
- Feedback de progresso: barra/contador simples exibindo enviados, falhas e pendentes durante a operação.
- Relatório final: total enviados com sucesso e total falhos, com lista opcional de IDs/telefones problemáticos.

## Contratos e Endpoints

### Templates (listar e obter)
- Base path: `/templates`
- `GET /templates`
  - Retorna lista de templates ordenados por `title` asc.
  - Campos esperados por item:
    - `id: string`
    - `title: string`
    - `content: string`
    - `tag: string`
- `GET /templates/:id`
  - Retorna um template específico com os mesmos campos acima.

### WhatsApp (envio de mensagem)
- Base path: `/whatsapp`
- `POST /whatsapp/sendWhatsappMessage`
  - Payload (SendWhatsappMessageDto):
    - `text: string` (mensagem; suporta `\n` para quebras)
    - `number: string` (telefone no formato `5511946974555`, sem `+`)
    - `googlePlaceId?: string` (opcional; se fornecido e sucesso, marca `firstMessageSent = true` no registro)
  - Resposta (WhatsappApiResponse):
    - `success: boolean`
    - `message?: string`
    - `error?: string`

## Integração com Contexto (Seleção)
- A tela lê do Contexto `ProspectsSelection` os itens selecionados (PlaceItem com `googlePlaceId`, `normalizedPhoneE164`, `displayName`).
- Persistência: somente em memória; não salvar seleção em storage.
- Se não houver itens: bloquear interação e exibir estado vazio com link para voltar.

## Fluxo de Usuário
- Ao montar a tela:
  - Buscar `GET /templates` para popular o select.
  - Select sem valor inicial; placeholder "Selecione um modelo".
  - Ao escolher um template, preencher o input de texto com `content` (o usuário pode editar livremente).
  - Exibir card com o número de contatos selecionados.
- Ao clicar em "Enviar":
  - Abrir modal de confirmação com resumo: quantidade de contatos, template selecionado (título) e primeira linha da mensagem.
  - Ações do modal: "Confirmar e enviar" e "Cancelar".

## Regras de Formatação de Telefone
- Usar o campo `normalizedPhoneE164` se disponível; caso contrário, usar `nationalPhoneNumber`.
- Remover todos caracteres não numéricos e o `+` do início, resultando no formato `DDDNXXXXXXXX` (ex.: `5511946974555`).
- Se após formatação o número for inválido (menos de 12 dígitos para BR), marcar como falha e seguir para o próximo.

## Comportamento de Envio em Lote
- Estratégia: iterar sequencialmente sobre os contatos com intervalo de 8 segundos entre cada requisição bem iniciada.
- Para cada contato:
  - Construir `number` formatado conforme regra acima.
  - Payload: `{ text: <mensagemAtual>, number, googlePlaceId: <id> }`.
  - Chamar `POST /whatsapp/sendWhatsappMessage`.
  - Em caso de sucesso (`success === true`): incrementar contador de sucesso.
  - Em caso de erro (HTTP ou `success === false`): registrar falha, continuar para o próximo.
- Intervalo: 8 segundos entre envios; não interromper operação em falhas.
- Telemetria de progresso: exibir contadores `enviados`, `falhas`, `restantes` e status corrente (ex.: "Enviando para <displayName>").

## Relatório Final
- Ao concluir todos os envios, apresentar um resumo:
  - `sucesso`: X
  - `falhas`: Y
  - Lista opcional: `{ googlePlaceId, number, reason }[]` para itens falhos
- Oferecer ações: "Voltar para Gerenciar Prospects" e "Ver detalhes".

## Estados de UI
- Carregando templates: skeleton ou spinner; erros exibem mensagem discreta e opção de tentar novamente.
- Envio em andamento: desabilitar inputs/seleção; permitir cancelar apenas antes de iniciar.
- Erros de rede durante envio: contabilizar falha, continuar e reportar.

## Checklist de Entrega
- Rota registrada em `routes` apontando para página `EnvioWhatsappPage`.
- Integração com Contexto para ler seleção e contador.
- Consumo de `GET /templates` e preenchimento de select e input.
- Modal de confirmação antes do envio.
- Loop de envio com intervalo de 8 segundos, continuação em caso de erro.
- Relatório final com totais de sucesso/falha.
- Uso de `POST /whatsapp/sendWhatsappMessage` com payload conforme `SendWhatsappMessageDto`.