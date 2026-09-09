# Contrato responsivo e validação visual

**AQ-WEB-1.0.0** · Autoridade para medidas. Layout fluido entre os intervalos abaixo; não escalar uma captura Figma como imagem.

## B01 — Breakpoints

| Faixa | Condição CSS | Container lateral | Grade base / gap |
| --- | --- | --- | --- |
| mobile | largura <768 px | 20 px | 4 colunas / 16 px |
| tablet | 768 ≤ largura <1100 px | 32 px | 8 colunas / 20 px |
| desktop | largura ≥1100 px | 48 px mínimos | 12 colunas / 24 px |

Container `width: calc(100% - 2 * gutter); max-width:1296px; margin-inline:auto`. Em 1440, largura 1296 e margem real 72 px. Em 1100, largura 1004 e margem 48 px. Em 1920, manter 1296; não esticar tipografia e cards para preencher a tela.

Em 320–359 px, manter gutter 20, fazer wrap de rótulos e botões e permitir altura natural. Não reduzir fonte de corpo abaixo de 16. Menu compacto em **toda largura <1100**, não depender de medir dinamicamente se cabe. Em 1100 passa a desktop.

## B02 — Geometria por faixa

| Elemento | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Header | 80 px | 80 px | 96 px |
| Logo visível | largura 180 px, altura auto | 200 px, auto | 220 px, auto |
| Padding vertical HeroHome | 48 px | 64 px | 80 px |
| Colunas HeroHome | 1 | 1 | 1fr 1fr |
| Gap copy/foto HeroHome | 32 px | 40 px | 48 px |
| Padding PageIntro vertical | 40 px | 48 px | 48 px |
| Padding de seção vertical | 48 px | 64 px | 80 px |
| Gap SectionHeading/grade | 24 px | 32 px | 32 px |
| SegmentCard grid | 1 | 2 | 4 |
| ActivityCard / ApprovalCard / AlbumCard | 1 | 2 | 3 |
| Grade de fotos de álbum | 1 | 2 | 3 |
| MediaText / SegmentDetail | 1 | 1 | 1fr 1fr |
| Ambientes | 1 | 2, primeiro ocupa tudo | 2, primeiro ocupa tudo |
| Footer | 1 coluna | 2 colunas | 3 colunas |

Os valores do estudo que eram intervalos (ex.: 80–96 px de seção) são resolvidos pela tabela. Não adicionar seções vazias para criar ritmo. Com 1–2 cards numa grade de 3, manter largura de coluna e alinhamento à esquerda; não ampliar o card para largura de hero. A grade de quatro segmentos permanece na ordem editorial.

Hero desktop: duas colunas iguais, fotografia 4:3, copy centralizada verticalmente. Mobile/tablet: copy antes da foto, tudo alinhado à esquerda. Não usar min-height:100vh nem travar H1 em duas linhas. CTA group: mobile em coluna com largura 100%; tablet/desktop em linha com wrap e largura pelo conteúdo. Não colocar texto sobre a foto em nenhuma faixa.

PageIntro interno tem altura natural, não altura mínima de banner. Introdução até 65ch. Em 390×844, sua altura não deve empurrar todo o primeiro bloco de conteúdo para além da dobra por espaçamento artificial. É meta de composição, não autorização para cortar texto aprovado.

## B03 — Tipografia exata

| Token | Mobile | Tablet | Desktop | Peso / line-height |
| --- | --- | --- | --- | --- |
| hero-title | 40 px | 56 px | 64 px | 700 / 1.08 |
| page-title | 36 px | 44 px | 52 px | 700 / 1.1 |
| section-title | 30 px | 36 px | 40 px | 700 / 1.15 |
| card-title | 24 px | 24 px | 24 px | 700 / 1.2 |
| body | 16 px | 18 px | 18 px | 400 / 1.6 |
| hero-support | 18 px | 20 px | 20 px | 400 / 1.5 |
| nav / button | 16 px | 16 px | 16 px | 500 / 1.3 |
| caption / eyebrow | 14 px | 14 px | 14 px | 400 ou 500 / 1.4 |

Valores em px são equivalentes de referência com raiz 16 px; implementar em rem para respeitar preferências do navegador. Não sobrescrever font-size global para neutralizar zoom. Limite do título Hero é a largura da coluna; corpo máximo 65ch; H1 interno máximo 22ch. Sem line-clamp para títulos/conteúdo; cabeçalhos longos podem aumentar altura.

## B04 — Camadas, scroll e toque

Header sempre sticky, altura constante; compensação de âncoras e scroll-padding = altura do header + 24 px. Hash deve revelar H2 completo e sua primeira linha de conteúdo. Menu/lightbox bloqueiam body e restauram posição. Não sobrepor dois dialogs.

No lightbox: área total 100dvh, fallback 100vh; safe-area considerada. Controles de 44 px, padding externo 16 px mobile / 24 px demais. A mídia ocupa espaço restante entre barra superior e legenda rolável, com contain. Em paisagem baixa, reduzir espaço da mídia e deixar legenda rolar; nunca ocultar Fechar.

Nenhuma informação depende de hover. Aplicar efeitos de hover só em ponteiro que suporte hover; foco segue disponível em todos. Sem barra fixa de WhatsApp/CTA inferior em V1. Elementos decorativos não provocam scroll horizontal; não usar overflow-x:hidden no body para mascarar erros de layout.

## B05 — Matriz obrigatória de revisão

1. Todas as sete páginas em 390×844 e 1440×900, com conteúdo representativo e screenshots de página inteira.
2. Home, Ensino, Visite e Galeria em 360×800, 768×1024 e 1024×768.
3. Header/menu em 1099 e 1100 px, incluindo redimensionar com menu aberto.
4. Home em 320×700 e 1920×1080: sem overflow; container máximo respeitado.
5. Álbum e lightbox em 390×844 e 844×390; foto retrato e paisagem, legenda longa, primeira/última foto e erro de imagem.
6. Zoom 200% e navegação por teclado em desktop; texto ampliado não corta botões nem força sobreposição.
7. Movimento reduzido: conteúdo continua visível, navegação funciona, nenhum autoplay.
8. Estado sem dados de Aprovações, Espaço, Atividades e Galeria; etapa incompleta e canais de contato ausentes.

Fixtures de QA podem ter conteúdo sintético claramente marcado e isolado do build público. Não publicar essas fixtures. Verificar que títulos longos e cards sem fotografia se ajustam; screenshots só com títulos curtos não bastam.

Comparação com Figma: avaliar grid, linguagem, proporções e marca; aplicar diferenças de design-spec em vez de copiar pixels contraditórios. Guardar resultados no diretório de QA escolhido pelo implementador e referenciá-los no relatório. Captura não substitui teste manual de foco, menu e links. Informar se faltou ambiente para alguma verificação, sem marcar o item como aprovado.
