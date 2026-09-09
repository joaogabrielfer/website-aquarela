# Contrato de componentes

**AQ-WEB-1.1.1** · Normativo. Tokens em [design-spec.md](./design-spec.md), geometria em [responsive.md](./responsive.md), dados em [content-model.md](./content-model.md).

Os nomes abaixo identificam responsabilidades; podem ser adaptados ao padrão de nomes da stack, mantendo uma correspondência no relatório de entrega. Reusar componentes entre rotas. Não criar variantes por página quando a diferença for apenas conteúdo.

## C01 — PageShell / Header / MobileMenu

PageShell: skip link → Header → main → Footer. Uma única instância de menu e lightbox por vez. Header branco, borda inferior subtle; `position:sticky; top:0`, altura constante, sem encolher a logo ao rolar. Após `scrollY > 16`, adicionar a sombra de header; retirar quando `<=16`. Shadow não modifica layout. Camadas: conteúdo 0, header 20, menu 40, lightbox 50.

Header: logo com nome acessível “Aquarela — início”; DesktopNav com links R01; CTA principal “Quero conhecer”. Ativo: navy, peso 700, sublinhado de 2 px e `aria-current=page`; a cor vermelha isolada do Figma é substituída por esse estado. Foco não depende de hover.

Menu compacto: logo e botão de ícone 44×44, “Abrir menu”, `aria-expanded` e `aria-controls`. Abrir mostra painel modal abaixo da área superior da tela, com fundo branco, altura disponível e rolagem própria. Lista em uma coluna, “Início” primeiro, CTA por último. Botão “Fechar menu” permanece acessível no painel. Backdrop preto a 40% é clicável para fechar; clique dentro não fecha.

Abrir: guardar acionador, bloquear scroll do body sem deslocar o conteúdo, tornar fundo inerte, focar botão Fechar. Tab fica no modal. Esc, backdrop, Fechar ou navegação encerram menu. Fechamento sem navegar devolve foco ao acionador e scroll original. Após navegar, aplicar política de foco de rota. Ao cruzar para desktop com menu aberto, fechar, liberar body/inert e focar link ativo do DesktopNav se o foco estava no painel. Nunca deixar foco em elemento oculto.

## C02 — Button / TextLink / IconButton

API conceitual: `variant: primary | secondary | inverse | text`, `size: md | sm`, `href?`, `disabled?`, `icon?`, `accessibleLabel?`. Elementos: `a` se navega, `button type=button` se opera estado. Sem nested links. Ícones decorativos `aria-hidden`.

| Variante | Default | Hover | Pressed |
| --- | --- | --- | --- |
| primary | fundo action-primary, texto branco, sem borda | action-hover | action-pressed |
| secondary | branco, navy, borda 1 px navy | paper | surface-disabled |
| inverse | branco, navy, borda 1 px branca; só em fundo navy | paper | surface-disabled |
| text | sem fundo/borda, navy, sublinhado | ink, sublinhado | ink |

Tamanho md: min-height 48 px, padding 12px 24px, fonte 16/1.3, gap 8, raio pill. sm: min-height 44 px, padding 10px 16px, mesma fonte. O texto pode quebrar em tradução/zoom e aumentar altura; nada de height fixa com clipping. IconButton: 44×44 mínimo, ícone 20 px e nome acessível obrigatório; hover paper em fundo claro.

Focus-visible conforme anel global. Disabled apenas para ações realmente indisponíveis de interação (ex.: seta na primeira foto): fundo/texto disabled, sem sombra/hover, atributo `disabled` nativo. Links para dados ausentes são omitidos, não links disabled. Sem loading state de formulário: formulário não faz parte da v1.

## C03 — Inputs e seletores: limite explícito

**Não há campo de formulário nem seletor de filtro na v1.** Não implementar input de nome/e-mail, busca ou select apenas porque uma biblioteca os fornece. Filtros e formulários do estudo estão fora do escopo congelado; os botões de paginação não são inputs.

Para evitar decisões implícitas caso haja revisão futura, padrão reservado: label visível acima; input de texto com min-height 48, padding 12px 16px, raio control, branco, borda 1 px border-control, texto ink 16 px. Estados default/focus/disabled/error, com mensagem de erro textual associada e `aria-invalid`; nunca placeholder como label. Este padrão **não autoriza construir a feature**. Select, textarea e fluxos de envio precisam de adendo de contrato antes de uso.

## C04 — HeroHome / PageIntro / Breadcrumb

HeroHome: eyebrow → H1 → apoio → grupo de duas ações → mídia. DOM segue essa ordem em todas as larguras; desktop posiciona copy/mídia em colunas. Gap no copy 24 px; entre título e apoio 24 px; grupo de ações com gap 12 px. Fonte e tamanhos em responsive. Foto 4:3 e sem overlay textual. Até uma forma vetorial secundária; não ocultar rosto nem invadir texto.

PageIntro: breadcrumb → H1 → introdução opcional; gap 16 px. Variantes: `default` branco, `paper` creme, `space` ciano com texto ink, `achievements` amarelo com navy, `activities` paper com pequena linha roxa de 4 px antes do título. Não exibir fotografia no PageIntro interno: primeira mídia entra na seção de conteúdo logo abaixo, evitando competir com H1. Esta decisão detalha e substitui a sugestão aberta de foto na abertura de Atividades.

Breadcrumb: nav com nome “Você está aqui”, lista ordenada; itens anteriores são links, último texto sem link e `aria-current=page`. Cor muted somente em superfícies claras; nas aberturas ciano/amarelo, ink. Fonte 14/1.4, separador decorativo. Wrap permitido; não gerar overflow.

## C05 — SectionHeading / MediaText / SegmentAnchorNav

SectionHeading: H2 + introdução opcional de até 65ch + link de seção opcional. Gap 16 px; distância para grade 32 px desktop, 24 px mobile. Links de seção ficam após o título/apoio na ordem do DOM; não esmagar título para forçar uma linha.

MediaText: foto 4:3 + coluna de título, até dois parágrafos e lista de três fatos aprovados. Em desktop, mídia à esquerda; mobile, texto antes da mídia. Não alternar arbitrariamente em cada render. Sem três fatos e foto aprovados, ocultar bloco de proposta da home conforme modelo.

SegmentAnchorNav: quatro links em área branca, wrap entre linhas; sem scroll horizontal oculto. São links simples, não tabs ARIA. Não acompanhar seção visível com JavaScript em V1. Ativar link usa hash e posiciona destino abaixo do header. Todos os quatro SegmentDetail permanecem no DOM.

## C06 — Cards: variantes e anatomia

Base comum: branco, raio card, borda 1px subtle, mídia recortada nos cantos superiores, corpo padding 24 px (20 px mobile), gap 12 px. Títulos H3, texto ink, legendas muted apenas sobre branco. Grade alinha cards da mesma linha; ação pode usar margin-top:auto. Conteúdo nunca é truncado automaticamente para caber em altura fixa.

| Componente | Conteúdo obrigatório | Mídia | Interação |
| --- | --- | --- | --- |
| SegmentCard | Título de etapa, link “Conhecer esta etapa”; resumo aprovado opcional | 4:3 | Um único link envolvendo card; destino exato R02; sem outros botões dentro |
| ActivityCard summary | Nome, resumo | 4:3 se aprovado | Link textual “Ver atividades” para `/atividades` |
| ActivityCard detail | Nome, descrição, público aprovado; metadados opcionais | 4:3 se aprovado | CTA “Consultar esta atividade”; card inteiro não é clicável |
| ApprovalCard | Nome autorizado, curso, instituição, processo e ano | Retrato 4:5 opcional | Informativo, sem hover de link; não inventar página do estudante |
| AlbumCard | Capa, título, data, categoria | 4:3 | Um link envolvendo card para álbum |
| EnvironmentCard | Nome, finalidade, foto com legenda | Primeiro 16:9; demais 4:3 | Botão da foto abre lightbox; corpo não é botão |

Somente cards inteiros navegáveis (SegmentCard/AlbumCard) recebem sombra e borda navy no hover/focus-within; sem scale/translate. Focus ring permanece no link. Cards informativos não simulam interatividade. A legenda da foto não contém instruções internas de aprovação.

SegmentDetail: H2 com ID de âncora, texto, foto 4:3, lista de experiências e metadados opcionais, CTA contextual. Layout MediaText; título da etapa sempre visível mesmo com conteúdo pendente. Caso vazio, usar estado C10 e não preencher com generalidades promocionais. SegmentCard de etapa ainda não aprovada mantém apenas nome e link de consulta no build público, sem espaço artificial de foto nem resumo inventado; preview pode usar AssetPlaceholder. O lançamento final continua condicionado aos quatro segmentos aprovados.

## C07 — AlbumGrid / PhotoGrid / GalleryPreview

AlbumGrid usa AlbumCard e lotes R02. PhotoGrid usa botões de miniatura com foto, alt e nome acessível “Ampliar foto {n} de {total}: {legenda curta}”; título ou alt pode suprir legenda curta ausente. Lotes novos são anexados sem remontar os anteriores. “Carregar mais” fica abaixo e mantém foco; anunciar “{n} itens adicionados” via status polite. Ao terminar, substituir o botão focado por texto focável programaticamente “Todos os itens foram exibidos” e mover foco para esse status; não sumir com foco no body.

GalleryPreview da home: no máximo três fotos de ambientes distintos; desktop primeira ocupa duas colunas e duas menores empilhadas à direita. Mobile são uma foto principal e até duas abaixo, todas 4:3. Com apenas uma, usar uma imagem; com duas, duas colunas equivalentes desktop. Fotos da home não abrem lightbox, link de seção leva a Nosso espaço. Não duplicar foto para preencher composição.

## C08 — Lightbox

Modal com nome “Visualização de fotos”, overlay preto 85%, mídia contain, sem cortar imagem. Barra superior: contador e Fechar; área principal: imagem e controles anterior/próxima; abaixo: legenda. Imagem com alt; contador em status polite após navegação. Lightbox abre apenas por ação explícita.

Primeira imagem: anterior disabled; última: próxima disabled; não fazer loop. ArrowLeft/ArrowRight navegam quando lightbox está aberto; Esc fecha; Tab fica no modal. Cliques no fundo externo à mídia/controles fecham; clique na imagem não. Swipe não é requisito. Botões clicáveis em toque são obrigatórios.

Ao abrir: guardar acionador, focar Fechar, bloquear rolagem/fundo inerte. Fechar: liberar e restaurar foco/scroll no acionador original, independentemente da imagem atual. Falha no carregamento: manter contador/legenda e controles; mostrar “Não foi possível carregar esta foto” + botão “Tentar novamente”; não afirmar ausência do arquivo no colégio. Carregar imagem atual e no máximo as adjacentes, nunca pré-carregar o álbum inteiro em tamanho original.

## C09 — FAQ / ContactPanel / VisitCTA / Footer

FAQ usa details/summary nativo, todos fechados inicialmente e múltiplos podem ficar abertos. Até seis perguntas aprovadas por grupo. Título clicável tem min-height 48 px, ícone decorativo; texto da resposta com entrelinha 1.6. Sem perguntas aprovadas, ocultar grupo inteiro.

ContactPanel: introdução, interesse validado se houver, telefone/endereço/horário aprovados, grupo de links condicionais. Em `/visite`, telefone é primary; se WhatsApp estiver confirmado, passa a primary e telefone vira secondary; mapa é text. Não oferecer um controle de escolha de etapa: o contexto vem do link anterior, e texto “Ver todas as etapas” permite voltar a `/ensino`.

VisitCTA: fundo navy, H2 e apoio brancos, botão inverse “Quero conhecer”; sem inputs. Fundo escuro não muda a versão da marca. Footer branco, borda superior subtle, logo original, assinatura aprovada, links de navegação, contatos e privacidade. Ano de copyright pode ser ano corrente; ano de aprovação/evento nunca deve ser inferido disso.

## C10 — EmptyState / AssetPlaceholder

EmptyState: fundo paper, padding 32/24 px, título H2 ou H3 conforme contexto, texto ink, link real. Sem spinner, animação ou número fictício. Aprovações/Galeria usam os textos de routes; Atividades: “Consulte as atividades do Aquarela”, apoio “Converse com a equipe para conhecer as opções disponíveis.”; Espaço: “Conheça a escola de perto”, apoio “Fale com a equipe para combinar uma visita.”; etapa: “Converse com a equipe sobre esta etapa.” Não prometer data de atualização.

AssetPlaceholder existe **apenas no preview editorial explícito**: ocupa mesma proporção da mídia, fundo paper, borda tracejada muted e rótulo “Foto oficial pendente”. Não é imagem gerada, não aparece no build público. Conteúdo faltante em produção segue regras de bloqueio/omissão, nunca renderiza texto técnico.

## C11 — SeasonalBanner

Componente opcional reutilizável, no máximo uma vez na Home, imediatamente após
o Hero e antes das etapas. Exibe conteúdo textual e CTA/destino opcional em par;
destinos são rotas internas seguras. Não possui carrossel, autoplay, dismiss,
agendamento automático, imagem obrigatória, formulário, backend ou tracking.
O público só recebe registros `active` e `approved`; preview explícito também
pode mostrar draft/observed. A fixture sintética não é conteúdo real.
