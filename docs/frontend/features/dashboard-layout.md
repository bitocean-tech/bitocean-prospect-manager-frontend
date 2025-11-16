# Dashboard — Layout

Objetivo: especificar o layout do dashboard autenticado, com componentes reutilizáveis

## Requisitos
- Layout com itens componentizados.
- Sidebar lateral com as rotas:
  - "Buscar negócios"
  - "Enviar mensagens"
- Logo redondo no topo do menu e nome "Prospect Manager".
- Ícones do Lucide para cada item do menu.
- Menu padrão aberto, com opção de esconder e abrir com botão hambúrguer.
- Header com o logo (de `assets`) no canto direito e mais nada.
- Layout aplicado como root das rotas autenticadas (navegação ocorre dentro do layout).
- Garantir responsividade em todos os elementos.

## Componentização
- `AppLayout`: layout raiz autenticado, encapsula `Sidebar`, `Header` e área de conteúdo.
- `Sidebar`: menu lateral com logo, nome, itens com ícones e comportamento de collapse.
- `Header`: barra superior com o logo alinhado à direita.

## Header (Detalhes)
- Somente o logo no canto direito.
- Sem outros elementos por ora.

## Responsividade
- Mobile-first com Tailwind.
- Sidebar responsiva: em telas pequenas, permitir recolher ou sobrepor (overlay) se necessário.

## Observações
- Tema padrão: dark (conforme especificação global), com suporte a light/dark.
- Usar classes Tailwind e componentes shadcn/ui para consistência visual.