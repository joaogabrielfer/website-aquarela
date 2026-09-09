# Rotas e composição

**AQ-WEB-1.1.1** · Normativo. Complementa [design-spec.md](./design-spec.md).

## R01 — Regras globais

URLs sem barra final, exceto `/`. Todas devem abrir por link direto e refresh. Header/Footer em todas, inclusive 404. Logo retorna a `/`. Menu desktop, nesta ordem: Ensino, Nosso espaço, Aprovações, Atividades, Galeria; CTA “Quero conhecer” → `/visite`. Menu compacto acrescenta Início antes de Ensino. Manter links das sete páginas mesmo sem dados; estados vazios têm destino útil.

`/ensino` é ativo com qualquer hash; `/galeria` também é ativo em seus álbuns; query não muda item ativo. Links de apoio Privacidade e Instagram ficam no rodapé, não na navegação principal.

Título HTML: `{título curto} | Aquarela Colégio e Curso`; home: `Aquarela Colégio e Curso | Paulista/PE`. H1 definido abaixo. Descrição editorial por rota e canonical absoluto a partir de domínio configurado; nunca inventar domínio de produção. Preview tem noindex. Produção tem sitemap das rotas públicas e álbuns publicados; 404 e preview não entram. Parâmetros de interesse não criam canonical diferente.

## R02 — Sequência fechada de páginas

As condições de dados são as de `content-model.md`. Se uma seção opcional não tiver registros publicados, removê-la inteira, inclusive padding; não alterar a ordem das restantes. As cópias abaixo são baseline de preview e precisam de revisão editorial antes de publicação.

### `/` — Início · Figma [2:2](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-2)

| Ordem / ID | Composição | Dados / ação |
| --- | --- | --- |
| 1 `inicio` | HeroHome, fundo paper | Rótulo “Aquarela Colégio e Curso · Paulista/PE”; H1 “Presente em cada fase. Pronto para novas descobertas.”; apoio “Conheça as etapas de ensino, os espaços e as experiências do Aquarela.” |
| 2 `banner-sazonal` | SeasonalBanner opcional, após o Hero | No máximo um banner `active`; público somente approved, preview pode mostrar draft/observed; CTA/destino opcionais em par |
| 3 `etapas` | SectionHeading + 4 SegmentCard, fundo branco | H2 “Ensino em cada fase”; ordem Infantil, Anos Iniciais, Anos Finais, Médio; destinos na tabela de Ensino abaixo |
| 4 `proposta` | MediaText, fundo paper | H2 “O jeito Aquarela de aprender”; foto + 3 fatos pedagógicos aprovados; ocultar bloco se conteúdo incompleto |
| 5 `espacos` | GalleryPreview de ambientes, fundo branco | H2 “Espaço para novas descobertas”; até 3 fotos de ambientes distintos; link “Conheça nosso espaço” → `/nosso-espaco`; ocultar sem fotos |
| 6 `atividades` | 3 ActivityCard resumidos, fundo paper | H2 “Além da sala de aula”; seleção editorial; link “Ver atividades” → `/atividades`; ocultar sem dados |
| 7 `conquistas` | Até 3 ApprovalCard, fundo branco | H2 “Histórias e conquistas”; link “Conheça as aprovações” → `/aprovacoes`; ocultar sem dados |
| 8 `vida-aquarela` | Até 3 AlbumCard, fundo paper | H2 “A vida no Aquarela”; recentes por data decrescente, ID desempata; link “Ver galeria” → `/galeria`; ocultar sem dados |
| 9 `visita` | VisitCTA, fundo navy | H2 “Venha conhecer o Aquarela”; CTA “Quero conhecer” → `/visite` |

Hero: CTA principal “Quero conhecer” → `/visite`; secundário “Explore nosso ensino” → `/ensino`. Sem FAQ duplicado na home. Header/Footer são shell externo, não itens numerados de conteúdo.

Sem `PageCopy` approved, o público usa H1 funcional neutro e omite meta
description/og:description; o preview editorial pode usar `PageCopy` draft ou
observed. Após o Hero pode haver no máximo um SeasonalBanner ativo.

### `/ensino` — Ensino · sem frame

H1 “Cada fase tem suas descobertas”. Ordem: PageIntro paper → SegmentAnchorNav branca → quatro SegmentDetail em ordem fixa, alternando branco/paper → FAQ de ensino (se publicado) → VisitCTA → Footer.

| Slug de etapa / âncora | Título H2 | Destino do card e CTA |
| --- | --- | --- |
| `educacao-infantil` | Educação Infantil | `/ensino#educacao-infantil`; `/visite?interesse=educacao-infantil` |
| `fundamental-anos-iniciais` | Ensino Fundamental — Anos Iniciais | `/ensino#fundamental-anos-iniciais`; `/visite?interesse=fundamental-anos-iniciais` |
| `fundamental-anos-finais` | Ensino Fundamental — Anos Finais | `/ensino#fundamental-anos-finais`; `/visite?interesse=fundamental-anos-finais` |
| `ensino-medio` | Ensino Médio | `/ensino#ensino-medio`; `/visite?interesse=ensino-medio` |

Texto do CTA: “Conversar sobre esta etapa”. Cada detalhe: título, foto, introdução, séries/turnos apenas confirmados, 2 experiências aprovadas e CTA. Todos os detalhes visíveis no documento; sem abas que removam conteúdo. Sem dados da etapa, manter título/âncora + EmptyState de etapa + CTA; não criar afirmações pedagógicas.

### `/nosso-espaco` — Nosso espaço · Figma [2:3](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-3)

H1 “Espaço para aprender. Liberdade para descobrir.” Ordem: PageIntro space com breadcrumb → introdução aprovada, até 70 palavras → grade EnvironmentCard editorial (primeiro amplo, restantes em pares) → dados de acesso confirmados → VisitCTA → Footer. EmptyState substitui grade ausente. Sem vídeo/tour em V1. Fotos ampliam no lightbox, com nome e finalidade do ambiente.

### `/aprovacoes` — Aprovações · Figma [2:4](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-4)

H1 “Conquistas que abrem novos caminhos”. PageIntro achievements → grupos de resultados por ano, decrescentes → link “Conheça o Ensino Médio” → `/ensino#ensino-medio` → VisitCTA → Footer. Dentro do ano: ordenar por nome de exibição em pt-BR, depois ID. Ano é H2, cada resultado é H3. Sem filtro nem estatística total nesta versão. Cada grupo exibe no máximo 12 registros inicialmente; botão “Carregar mais aprovações de {ano}” acrescenta 12 no próprio grupo. Sem reset dos grupos ao carregar outro.

Zero registros: EmptyState “Resultados em atualização” com texto “Fale com a equipe para conhecer as trajetórias do Aquarela.” e link `/visite`. Manter o acesso ao Ensino Médio. Não inserir cards fictícios no público.

### `/atividades` — Atividades · Figma [2:5](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-5)

H1 “Novos interesses, novas descobertas”. PageIntro activities → grid ActivityCard completo em ordem editorial → FAQ de atividades aprovado → VisitCTA → Footer. CTA de cada card “Consultar esta atividade” → `/visite?interesse=atividade-{slug}`. Não criar subrotas de modalidade, filtros ou preços presumidos. EmptyState se não houver ofertas confirmadas.

### `/galeria` — Galeria · Figma [2:6](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-6)

H1 “A vida acontece em muitas cores”. PageIntro default → AlbumGrid → link “Acompanhe no Instagram” → VisitCTA → Footer. Ordem de álbuns por data decrescente e ID para desempate. Exibir 9, acrescentar 9 por “Carregar mais álbuns”. Card navega para `/galeria/{slug}`, não abre lightbox direto. Sem categorias filtráveis em V1; categoria é metadado textual do card.

Sem álbuns, EmptyState “Novos registros em breve” e link para o Instagram público aprovado. Não usar posts remotos como preenchimento automático.

### `/galeria/{slug}` — Álbum · sem frame

Somente slug de álbum publicado. Breadcrumb “Início / Galeria / {título}”, H1 título, data por extenso, categoria, introdução, grade de 12 fotos + “Carregar mais fotos” em lotes de 12 e link “Voltar à galeria”. Lightbox acessa **todas** as fotos publicadas do álbum, mesmo além do lote de miniaturas visível. Ao fechá-lo, devolver foco ao botão que o abriu. Slug inexistente/draft é 404 no build público, não página vazia.

### `/visite` — Visite · sem frame

H1 “Venha conhecer o Aquarela”. PageIntro paper → ContactPanel → FAQ de visita aprovado → Footer. Não repetir VisitCTA apontando para a própria página. ContactPanel explica: “Converse com a equipe para combinar sua visita.”

Botão “Ligar para o colégio” → `tel:{phoneE164}` quando publicado. “Conversar no WhatsApp” só com canal confirmado; “Como chegar” só com URL aprovada. Não renderizar botões desabilitados para contatos desconhecidos. Nunca agendar automaticamente ou mostrar confirmação de visita.

`interesse` aceita apenas os quatro slugs de etapa ou `atividade-{slug}` de atividade publicada. Desconhecido/duplicado: ignorar e usar contato genérico. Exibir nome humano, nunca query crua. Mensagem para WhatsApp: “Olá! Gostaria de conhecer o Aquarela e saber mais sobre {nome do interesse}.” Sem interesse: “Olá! Gostaria de combinar uma visita ao Aquarela.” Construir URL com número confirmado sem `+` e mensagem codificada; abrir não envia mensagem. Telefone funciona normalmente mesmo sem WhatsApp.

### `/privacidade` e 404

Privacidade: shell, breadcrumb e texto editorial aprovado sobre funcionamento efetivo. Não inventar controlador, política de cookies ou operações de coleta. Preview exibe pendência; publicação é bloqueada se a página não estiver aprovada. Sem trackers/embeds terceiros em V1, portanto não adicionar banner de cookies decorativo sem função.

404: H1 “Página não encontrada”, explicação breve e links “Voltar ao início” e “Falar com o colégio”. Responder com status HTTP 404 quando o host suportar. Documentar limitação de hospedagem se não suportar; não criar fallback que devolva home silenciosamente.

## R03 — Validação de rotas

Testar acesso direto e refresh de todas as rotas, âncoras com header sticky, retorno pelo histórico, query inválida, slug desconhecido, álbum não publicado e links externos reais. Não criar links com destinos supostos para conteúdo ausente.
