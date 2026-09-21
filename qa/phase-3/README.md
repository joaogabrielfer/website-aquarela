# Fase 3 — qualidade, acessibilidade e evidências

Período: 17–21/09/2026. Estado: **auditoria técnica concluída; release bloqueado**.
Base: `42bdfa0`. Branch: `phase/3-quality-audit`. Contrato efetivo:
AQ-WEB-1.1.4, com os cinco hashes verificados antes da implementação.

## Implementação verificada

- A query `interesse` de Visite agora é resolvida no navegador sobre o HTML
  estático. Parâmetros vazios, desconhecidos ou duplicados permanecem genéricos.
  Apenas slugs e nomes já projetados são serializados; dados de revisão não vão
  para o cliente.
- O menu preserva foco ao cruzar 1099→1100 px, mantém o fundo inerte, prende Tab,
  fecha com Escape e impede sobreposição com o lightbox. O cabeçalho normaliza
  caminhos `.html` durante o build estático, portanto o item ativo volta a ser
  emitido e pode receber foco.
- O lightbox foi exercitado em retrato e paisagem, com primeira/última foto,
  setas, Escape, retorno de foco, legenda longa e erro de imagem. A faixa
  editorial deixou de encobrir seus controles.
- A paginação foi validada com fixture sintética isolada: preserva itens, mantém
  foco no botão entre lotes, move foco ao estado final e anuncia singular/plural.
  A página da fixture é copiada temporariamente para `src/` apenas durante os
  builds e2e e removida em `finally`; rota e bundle não entram no build normal.
- Breadcrumb recuperou o sublinhado normativo; metadados e detalhes de contato
  respeitam 16 px no mobile; o painel de contato ganhou respiro interno; estados
  hover dependem de dispositivo compatível.
- A varredura axe não encontrou violações críticas ou sérias nas oito rotas e o
  menu aberto não introduziu violações. Movimento reduzido e uma aproximação da
  área útil em zoom 200% permaneceram operáveis e sem clipping.
- O servidor estático de QA reproduz rotas `format: file`, 404 reais e rejeita
  URL malformada com 400. Builds público e editorial são separados por portas e
  diretórios próprios.

## Checks finais

- `pnpm check`: 69 arquivos, zero erros, avisos ou hints.
- `pnpm lint`: passou.
- `pnpm test`: 66 testes unitários passaram.
- `pnpm test:e2e`: 139 testes passaram e 33 foram ignorados de propósito no
  projeto oposto (matriz visual somente editorial e asserts de modo específicos).
- `pnpm check-content`: passou.
- `pnpm build` e `pnpm build:preview`: passam; a fixture de QA não é emitida.
- `pnpm check-release`: continua recusando o release pelos bloqueios editoriais
  D06 descritos abaixo.

## Matriz visual B05

As 33 capturas finais estão em [final](./final/):

- sete páginas em 390×844 e 1440×900;
- Home, Ensino, Visite e Galeria em 360×800, 768×1024 e 1024×768;
- Home em 320×700 e 1920×1080;
- menu em 1099 e cabeçalho desktop em 1100;
- lightbox sintético em retrato 390×844, paisagem 844×390 e erro 844×390.

A inspeção direta cobriu Home mobile, Ensino desktop, Visite mobile, menu nos
breakpoints e os três estados do lightbox. Uma folha de contato adicional foi
usada localmente para revisar as doze capturas intermediárias. Não apareceu
overflow, clipping de controle ou quebra de hierarquia nessa amostra.

## Recomendações anteriores

- Atendidas: composição compacta de Ensino, aberturas por cor, H1 limitado,
  estados vazios compactos, contato em duas colunas, remoção de CTA duplicado,
  horário sem dias presumidos e densidade revisada do rodapé.
- Continuam dependentes de conteúdo: equilíbrio final da Home com foto real,
  enquadramento das fotografias, descrição/público das atividades e densidade
  do rodapé com contatos finais.
- Lenis continua apenas proposta e não foi instalada. O scroll nativo atende o
  contrato atual e evita risco desnecessário antes do conteúdo definitivo.
- `AGENTS.md` e alguns perfis ainda citam AQ-WEB-1.1.3, embora os cinco arquivos
  normativos sejam AQ-WEB-1.1.4. É uma limpeza operacional; os hashes usados
  nesta fase correspondem à baseline efetiva.

## Bloqueios antes do release

`pnpm check-release` identifica seis grupos editoriais: identidade/localidade;
telefone ou WhatsApp aprovado; copy principal da Home; foto principal aprovada;
quatro segmentos completos com mídia; privacidade. Nenhum registro foi promovido
a `approved` por agentes. Aprovações, Espaço e Galeria continuam sem conteúdo
representativo.

Há também uma pendência técnica para a Fase 4: fotos de conteúdo ainda usam o
arquivo original em `<img>`, sem variantes responsivas, e `focalPoint` ainda não
é aplicado ao enquadramento. Como `content/media.yaml` está vazio, não seria
honesto marcar esse requisito como validado. Implementar e testar o pipeline com
assets autorizados é condição de release.

## Limites da validação

Lightbox e paginação foram validados com dados sintéticos claramente isolados,
pois não há álbum aprovado ou observado representativo. Não houve teste manual
em Safari ou Firefox nem validação em produção. O Chromium headless cobriu o
teclado e as interações descritas, mas não substitui a última revisão manual com
as fotografias finais e tecnologia assistiva real.

A comparação entre Muse Spark 1.3 e Union Alpha Free está em
[model-comparison.md](./model-comparison.md).
