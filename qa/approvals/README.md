# Aprovações — integração editorial de 30/10/2026

## Escopo

Dez conquistas transcritas das dez artes fornecidas, com oito retratos distintos.
Na revisão 1.1.12 solicitada pelo usuário, o mural reúne essas conquistas em
oito cards por pessoa/ano. Cada conquista continua um registro independente.
Breno e José têm selo “2 aprovações” e lista visível de ambas as conquistas;
os demais cards têm um resultado, sem selo. Sem totais gerais ou destaque
automático na Home.
Cards informativos: foto à esquerda e texto à direita no mobile; tablet
vertical em duas colunas; desktop compacto em quatro colunas, com mídia 4:3
e retrato inteiro em contain. Paleta e tokens vigentes.
A mesma implementação de card atende o mural e o componente Astro da Home.

## Proveniência e pendências editoriais

- Originais preservados em `assets/approvals/`, identificados pelo ID da conquista.
- Todos os registros continuam `observed`, com `reviewedAt` e `reviewedBy` nulos.
- `publicationAuthorized` permanece falso: o pedido atual escolhe preview editorial.
  A projeção permite a conferência na prévia explícita; público/release continuam
  exigindo status aprovado e autorização. Os metadados não chegam ao navegador.
- O pedido autoriza o tratamento dos retratos para essa prévia (`usageApproved`).
  Isso não promove o estado editorial das mídias.
- A fonte CPAEAM escreve **José Kauã** e a fonte CFN escreve **José Cauã**.
  Cada registro preserva sua grafia, usando o mesmo retrato. O card agrupado
  exibe ambas as grafias separadas por “ / ”. Confirmar antes de aprovar;
  não escolher silenciosamente o nome.
- **Ricardo Cesar** foi transcrito sem acrescentar acento ausente na fonte.
- CPAEAM: processo **CPAEAM 2027** e ano **2027**, conforme as artes.
- CFN: processo **CFN 2026/2027**, preservando os dois anos da arte. O campo
  numérico de agrupamento usa o ano final **2027**; confirmar essa classificação
  editorial antes da aprovação pública.
- Instituição transcrita dos brasões: **Marinha do Brasil**.
- Nenhum identificador de aprovação humana foi criado. Publicação pendente
  da revisão dos nomes, conquistas, anos e permissão final de publicação.

## Tratamento dos retratos

Extração assistida pela ferramenta integrada de imagens, em modo de edição
com transparência; um recorte por pessoa. Sem recriar as artes promocionais.
Os resultados precisam de conferência editorial contra os originais.

Prompt aplicado separadamente a cada original (com o slug do retrato):

> Extraia somente a pessoa fotografada à direita como recorte transparente.
> Preserve rosto, identidade, expressão, cabelo, óculos, textura da pele, corpo,
> braços cruzados, mãos, uniforme, marcas e pose. Remova fundo, navio, céu,
> textos, brasões e rodapé. Sem nova pessoa, reconstrução, retoque ou mudança
> de traços. Preserve cabeça e corpo visíveis, sem inventar partes ausentes.
> Centralize em tela transparente 4:5, com pequena margem acima da cabeça.

Recortes em `assets/approvals/portraits/`; variantes WebP 400×500 e 800×1000
em `public/media/approvals/`, geradas sem distorção e com canal alfa preservado:

```bash
pnpm exec node scripts/generate-approval-portraits.mjs
```

O guard de build percorre também subpastas de mídia e exclui retratos não
aprovados do output público, inclusive para acesso direto à URL.

## Validação

- Integridade do contrato: cinco hashes conferidos; baseline AQ-WEB-1.1.13 registrada
  antes da implementação, conforme o pedido de cards compactos e horizontais.
- `pnpm check-content`: conteúdo válido, incluindo existência e dimensões reais.
- `pnpm check`: 0 erros, 0 avisos, 0 hints.
- `pnpm lint` e Prettier nos arquivos alterados: passaram.
- `pnpm test`: 78 testes unitários passaram, incluindo homônimos, identidade ausente,
  anos distintos, grafias divergentes, destaque e filtro de autorização.
- `pnpm qa:build:e2e`: builds público e editorial passaram.
- Playwright: `approvals.spec.ts`, `preview-absence.spec.ts` e
  `load-more.spec.ts`, 19 passaram; 15 skips condicionais por modo.
- Layout conferido em 320, 390, 767, 768, 1099, 1100, 1440 e 1920 px, com 1/2/4 colunas,
  sem overflow e com todos os retratos carregados.
- SSR sem JavaScript: oito cards, dez conquistas e dois selos presentes. Paginação genérica preservou foco,
  itens e anúncios. Axe na rota editorial: zero violações.
- Público: nenhum card observado, nenhum nome e URLs diretas de variantes
  400/800 retornando 404. Prévia: noindex e ausência de metadados internos.
- Capturas finais revisadas: `approvals-390.png` (390×844) e
  `approvals-1440.png` (1440×900), página inteira, retornando ao topo antes
  da captura para posicionar corretamente o header sticky.
- Hover real: ampliação geométrica de 1,02× e transição iguais ao SegmentCard,
  borda navy e sombra; `approvals-hover-1440.png` registra o estado. Redução de
  movimento desliga ampliação/transição; contexto touch/coarse não amplia.
- `pnpm build:preview`: build de trabalho disponível em `dist/`.

Não executados neste lote: matriz B05 completa das demais rotas, zoom real de
200%, leitor de tela, dispositivos físicos, build de release e validação em
produção. Não houve deploy nem push. O preview do T3 permitiu navegação e leitura
do DOM, mas falhou duas vezes na captura (`Preview automation snapshot timed
out after 15000ms`); a revisão visual usou o Playwright previsto pelo repositório.

## Checkpoints locais

- `757cb3f` — `docs(agents): allow direct implementation and Codex delegation`.
- Implementação e evidências: commit local separado após validação.

## Agrupamento de conquistas — revisão 1.1.12

Agrupamento por personId explícito e ano após filtrar permissões. Nunca por
coincidência de nome ou de retrato. Contagem do selo inclui somente as
conquistas visíveis no card. A Home aplica featured antes de agrupar e limita
a três cards, sem antecipar resultados não destacados. Paginação do mural
conta cards completos para não dividir as conquistas da pessoa entre lotes.

A lista sempre aberta foi escolhida para facilitar comparação e leitura em
mobile. A alternativa horizontal foi adotada na revisão 1.1.13 a pedido do
usuário; pequenos selos de processos seriam outra revisão visual possível. Acordeão/carrossel esconderiam resultados e não foram adotados.

## Cards compactos e horizontais — revisão 1.1.13

Pedido do usuário: menores no desktop, hover de Ensino na Home e foto à
esquerda/informações à direita no mobile. Mural desktop passou de três cards
de 416 px para quatro de 306 px em 1440 px. A mídia passou de aproximadamente
520 px para 228 px de altura, preservando a imagem inteira em contain.
A altura do texto continua natural e todas as dez conquistas permanecem
visíveis. A Home mantém até três destaques e recebe a mídia mais baixa e hover.

O teste de geometria verificou foto e texto lado a lado abaixo de 768 px,
empilhados a partir de 768 px; quatro colunas a partir de 1100 px. Em mobile,
foto centralizada verticalmente em coluna paper com divisor amarelo de 4 px.
Cards com duas aprovações crescem com o texto, sem corte de rosto ou conteúdo.
O hover decorativo não cria link, cursor de ação ou parada de teclado.
