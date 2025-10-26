# Autenticação — Especificação da Tela de Login

Objetivo: especificar a implementação da tela de autenticação com um único campo de entrada para a chave de acesso, validação via backend, persistência local e liberação de rotas privadas.

## Requisitos Funcionais
- Componente de login com apenas um input, label: "Chave de acesso".
- Layout minimalista, tema dark por padrão, suportando light/dark.
- Exibir logo redondo de `src/assets` e o nome da aplicação "Prospect Manager".
- Chamar rota de validação `GET /auth/validate` com `Authorization: Bearer <ACCESS_KEY>`.
- Se sucesso: persistir a chave localmente e liberar acesso às rotas privadas do dashboard.
- Se erro: exibir feedback discreto (toast ou mensagem inline) sem poluir a UI.

## Fluxo de Autenticação
1. Usuário informa a chave de acesso no input.
2. Ao enviar, a tela chama `/auth/validate` usando `Authorization: Bearer <ACCESS_KEY>`.
3. Em sucesso (HTTP 200): salvar a chave localmente e redirecionar para `/dashboard`.
4. Em erro: mostrar mensagem amigável e manter usuário na tela de login.

## Contrato de Autenticação
- Header: `Authorization: Bearer <ACCESS_KEY>`.
- Endpoint: `GET /auth/validate`.
- Resposta esperada: HTTP 200 indica válido. Qualquer outro status indica inválido/sem autorização.

## Persistência Local
- Armazenar a chave de acesso em cookies seguros após validação bem-sucedida.
- Configurar cookies com `httpOnly: false` (para acesso via JavaScript), `secure: true` (HTTPS), `sameSite: 'strict'`.
- Implementar funções para: salvar chave, recuperar chave, limpar chave.
- Chave deve ser automaticamente incluída em todas as requisições subsequentes.

## Cliente HTTP e Interceptor
- Configurar interceptor no cliente HTTP (Axios) para incluir automaticamente `Authorization: Bearer <ACCESS_KEY>` em todas as requisições.
- Base URL deve ser configurável via variável de ambiente (`NEXT_PUBLIC_API_URL`).
- Interceptor deve verificar se existe chave armazenada antes de incluir o header.

## Layout da Tela de Login
- Centralizada na tela com card minimalista.
- Logo redondo no topo (de `src/assets`).
- Título "Prospect Manager" abaixo do logo.
- Input único para "Chave de acesso" com placeholder apropriado.
- Botão "Entrar" que fica desabilitado durante validação.
- Estados visuais: normal, carregando, erro.

## Proteção de Rotas
- Implementar verificação de chave antes de carregar rotas do dashboard.
- Se não houver chave válida armazenada, redirecionar para `/login`.
- Aplicar proteção em todas as rotas privadas (`/dashboard/*`).

## Estados de UI
- Normal: formulário habilitado, botão "Entrar".
- Carregando: botão mostra "Validando..." e fica desabilitado.
- Erro: mensagem discreta de "Chave inválida ou não autorizada".
- Sucesso: redirecionamento imediato para `/dashboard`.

## Responsividade
- Layout adaptável para mobile e desktop.
- Card de login com largura máxima apropriada.
- Espaçamentos e tipografia ajustados para diferentes tamanhos de tela.

## Acessibilidade
- Labels associados aos inputs.
- Foco visível em elementos interativos.
- Mensagens de erro claras e acessíveis.
- Suporte a navegação por teclado.

## Integração com Tema
- Seguir padrão de tema dark/light definido na arquitetura.
- Suporte completo à alternância de tema conforme especificado na arquitetura.

## Checklist de Entrega
- Input único para chave de acesso com validação obrigatória.
- Chamada para `GET /auth/validate` com header `Authorization: Bearer <ACCESS_KEY>`.
- Persistência da chave em cookies seguros após validação.
- Interceptor HTTP configurado para incluir automaticamente a chave em requisições.
- Redirecionamento para `/dashboard` em sucesso.
- Feedback de erro discreto em falha de validação.
- Proteção de rotas privadas com redirecionamento para `/login`.
- Layout responsivo e acessível.
- Suporte completo ao tema dark/light.