# Contrato de implementação — Aquarela

**Contrato AQ-WEB-1.1.2 · congelado em 09/09/2026.**

“Congelado” significa baseline normativa para implementar, não aprovação dos dados escolares nem validação de um site pronto. Alterações de escopo ou aparência exigem revisão explícita deste contrato; conteúdo factual pode ser completado conforme o modelo de publicação, sem redesenhar a interface.

## 1. Autoridade e leitura

Ler os cinco arquivos antes de programar:

1. [design-spec.md](./design-spec.md): autoridade, tokens, critérios globais.
2. [routes.md](./routes.md): rotas, ordem de seções, textos e destinos.
3. [components.md](./components.md): anatomia, variantes e interações.
4. [responsive.md](./responsive.md): medidas e mudanças por largura.
5. [content-model.md](./content-model.md): dados, publicação, ausência e exemplos.

Cada arquivo é autoridade no seu domínio. `responsive.md` prevalece para geometria por viewport; `content-model.md` para visibilidade baseada em dados. Contradição entre arquivos não autoriza escolher silenciosamente: registrar e pedir resolução antes de executar a parte conflitante. Continuar partes independentes.

Este contrato substitui as recomendações abertas do [estudo DESIGN.md](../DESIGN.md) e do [registro histórico](../prototipo-figma.md). O [Figma](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA) é referência visual parcial, subordinada às correções aqui congeladas. Não revisitar concorrentes para reinterpretar o estilo durante a implementação. Instruções posteriores explícitas do usuário podem revisar o contrato.

## 2. Escopo fechado

Implementar as sete rotas institucionais, álbum, privacidade e 404 de `routes.md`. Marketing escolar, sem login, matrícula transacional, gerenciamento de alunos, pagamentos, marketplace, blog, notícias ou cards de professores. NewsCard e TeacherCard eram exemplos de especificação, não requisitos do Aquarela.

V1 inclui: segmentos, contatos condicionados à confirmação, menu mobile, FAQ, álbuns com lightbox e paginação progressiva local, metadados e estados sem conteúdo. Não inclui filtros de ano/categoria, campanhas fora do SeasonalBanner V1 autorizado nesta revisão, depoimentos, vídeo, formulário, tour, feed social ou chatbot. As propostas P1 do estudo ficam fora da baseline mesmo que haja componentes semelhantes numa biblioteca.

Não instalar CMS ou criar backend para esta versão. Usar conteúdo estático estruturado e gerar HTML público indexável. Preservar stack existente, se houver; caso o checkout continue sem aplicação, o implementador pode escolher uma solução com geração estática e registrar a escolha, comandos e versões no README. Framework é liberdade técnica; layout, rotas, comportamento e conteúdo não são. Nenhuma dependência de Figma em tempo de execução. Não publicar automaticamente como parte da implementação.

## 3. Tokens de cor

Usar os nomes CSS abaixo; valores são a única fonte para cores sólidas. Não usar paleta padrão da biblioteca como substituta.

| Token CSS | Valor | Uso |
| --- | --- | --- |
| `--brand-navy` | `#004C73` | Títulos, links, superfície institucional |
| `--brand-red` | `#F51623` | Acento gráfico, nunca botão com texto pequeno branco |
| `--brand-orange` | `#FA5721` | Decoração |
| `--brand-yellow` | `#FFBF0C` | Acento de aprovações |
| `--brand-cyan` | `#00B5E2` | Acento de espaço |
| `--brand-purple` | `#96248F` | Acento de atividades |
| `--surface-base` | `#FFFFFF` | Fundo padrão e cards |
| `--surface-paper` | `#FFF9EF` | Banner e seções de alternância |
| `--text-ink` | `#123747` | Corpo e texto sobre ciano |
| `--text-muted` | `#516574` | Legendas em superfícies claras |
| `--action-primary` | `#D91424` | CTA principal |
| `--action-hover` | `#B5101E` | Hover do CTA principal |
| `--action-pressed` | `#940D19` | CTA pressionado |
| `--border-subtle` | `#DCE4E8` | Divisões decorativas e cards |
| `--border-control` | `#516574` | Limite de controles |
| `--surface-disabled` | `#E7ECEF` | Controle desabilitado real |
| `--text-disabled` | `#516574` | Rótulo desabilitado |

Base branca/creme; no máximo duas cores saturadas dominantes por seção. Botão principal sempre vermelho de ação, independentemente da rota. Links de texto azul com sublinhado. Não alternar a cor da interface por etapa escolar.

Pares autorizados: ink/branco ou creme; navy/branco, creme ou amarelo; ink/ciano; branco/navy ou roxo; branco/action-primary. Branco/vermelho original ≈4,18:1 e navy/ciano ≈3,82:1: não usar em texto normal. Os cálculos iniciais estão no estudo; recalcular se mudar qualquer cor.

## 4. Tipografia, espaço e superfícies

Família `Outfit, system-ui, sans-serif`, pesos 400, 500 e 700. Arquivos WOFF2 locais com licença preservada e `font-display: swap`. Não usar requisições de fonte a terceiros em runtime. Se o asset de fonte não estiver disponível, usar fallback técnico e declarar a validação visual pendente; não chamar o fallback de design final.

Hierarquia exata por viewport em `responsive.md`. Peso 700 para títulos; 500 para navegação/botões; 400 para corpo. Texto alinhado à esquerda. Corpo com máximo 65ch. Não usar justificação, textos rasterizados nem quebras manuais obrigatórias. Rótulos curtos em caixa alta são permitidos; texto corrido não.

Escala de espaços, em px: `--space-1:4`, `--space-2:8`, `--space-3:12`, `--space-4:16`, `--space-5:20`, `--space-6:24`, `--space-8:32`, `--space-10:40`, `--space-12:48`, `--space-16:64`, `--space-20:80`, `--space-24:96`. Usar esses valores para padding e gap, salvo geometria de ícones/controles descrita.

Raios: `--radius-control:12px`, `--radius-card:20px`, `--radius-media:24px`, `--radius-pill:999px`. Seções abertas não têm raio nem sombra. Card tem borda de 1 px e nenhuma sombra padrão. Header após scroll e card de navegação no hover podem usar `0 4px 16px rgb(18 55 71 / 0.10)`. Menu/lightbox são camadas sobrepostas, não cards decorativos.

Movimento: cores/sombra em 160 ms, abertura de overlay em 200 ms, easing `ease-out`. Não animar a altura de conteúdo textual. `prefers-reduced-motion: reduce` remove transições e smooth scroll. Nada de autoplay, parallax, counters, skeleton permanente ou entrada que esconda conteúdo até JavaScript executar.

## 5. Mídia e composição

Hero da home: texto fora da imagem, fundo creme, foto real à direita no desktop, nenhuma sobreposição de texto/filtro na fotografia. Proporção 4:3, raio 24 px, um arco decorativo de cor de marca no máximo, atrás da mídia. O overlay citado no exemplo do usuário não é obrigatório e não pertence a este Hero.

Foto real do colégio com origem e uso aprovados. Não gerar alunos, ambientes ou depoimentos. Não recolorir/reconstruir a [logo original](../assets/logo-aquarela.PNG). Criar derivado com margens externas ajustadas, preservando proporção e pixels da marca; guardar o original. Logo sem SVG oficial deve permanecer raster de qualidade, não vetorização inventada.

Foto com `width`, `height`, variantes responsivas e ponto focal editorial. `object-fit:cover` apenas se o ponto focal mantiver pessoas inteiras no recorte necessário; se não, selecionar outro asset ou usar enquadramento contain com base neutra. Não esticar a imagem. Primeira foto da home carrega prioritariamente; demais, abaixo da dobra, sob demanda.

## 6. Acessibilidade e interação globais

Critérios de aceitação do projeto: texto normal ≥4,5:1, texto grande ≥3:1, controles/foco distinguíveis com contraste ≥3:1. Não declarar conformidade completa sem auditoria. Alvos interativos mínimos 44×44 px; links no corpo seguem altura da linha.

Foco: anel externo de 3 px navy separado por faixa branca de 2 px. Em superfície navy usar branco como anel externo e ink como separador. Deve continuar visível no redimensionamento e em todos os estados. Não remover outline sem substituição.

Um H1 por rota; hierarquia H2/H3 sem saltos criados por estética. Link “Pular para o conteúdo” primeiro na ordem de Tab, visível ao focar. Header/nav/main/footer semânticos; `lang=pt-BR`. Link navega, button muda estado. Não criar link `href="#"` como substituto para ação pendente.

Título da página atualizado na navegação. Em transição de rota client-side, foco no H1/main e scroll para topo; com hash, foco/scroll no destino; ao voltar pelo histórico, restaurar posição. Links externos abrem na mesma aba por padrão. Interações específicas em `components.md`.

## 7. Diferenças deliberadas do Figma

| Referência | Usar como base | Contrato prevalece em |
| --- | --- | --- |
| [Home 2:2](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-2) | Grid e linguagem clara | Sequência completa de seções em `routes.md` |
| [Header 3:8](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-8) | Logo e alinhamento | Ensino, CTA vermelho para Visite, sticky e menu compacto |
| [Hero 3:157](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-157) | Texto + área visual, creme | Foto real, copy em `routes.md`, tamanhos responsivos |
| [Arte 3:170](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-170) | Motivos de cor | Elemento secundário; não substituir foto final |
| [Espaço 2:3](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-3) | Identidade ciano | Texto ink, abertura menor, fotos e legendas |
| [Aprovações 2:4](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-4) | Acento amarelo | Mural real, ano explícito, estado vazio |
| [Atividades 2:5](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-5) | Abertura | Conteúdo e cards não existem no frame |
| [Galeria 2:6](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-6) | Abertura | Álbuns/lightbox não existem no frame |

Ensino, Visite, rodapé, mobile e estados são especificados por este contrato: não há desenho correspondente validado. Não gastar cota Figma tentando encontrar esses frames. O mapa expandido de IDs está em DESIGN.md, seção 10.

## 8. Entrega e critérios de conclusão

Implementação concluída requer: rotas e estados de dados funcionais; tokens centralizados; checks do projeto passando; links sem destino fictício; navegação de teclado; screenshots e revisão visual conforme `responsive.md`; README com comandos de execução/build e relatório do que foi testado.

Testes de maior valor: menu/Esc/foco, navegação profunda e refresh, lightbox e retorno de foco, paginação preservando itens, conteúdo não aprovado ausente no build público, contatos condicionais e rota inexistente. Não criar testes que apenas comparem hexadecimais ou espelhem markup.

Separar no relatório final: (1) implementação verificada, (2) conteúdo pendente, (3) validações não executadas. Só dizer “pronto para publicação” quando os bloqueios editoriais de `content-model.md` estiverem resolvidos. A falta de fotos não impede codificar e verificar placeholders de preview, mas impede chamar a composição final de validada.

## 9. Controle de mudança

Baseline 1.1.0 congela tokens, componentes, rotas, responsive e comportamentos. O agente não deve trocar fontes, criar páginas/features extras, mudar proporções ou remover uma rota por preferência. Ajustes técnicos sem mudança de comportamento são permitidos.

Para revisão autorizada: descrever motivo/impacto, atualizar todos os arquivos afetados e incrementar a versão compartilhada. Não editar o contrato para justificar retrospectivamente uma implementação divergente. Conteúdo aprovado substitui registros pendentes sem revisão de versão quando não altera schema ou escopo.

### Revisão AQ-WEB-1.1.0 — 09/09/2026

Revisão autorizada para preparar a demonstração da Home: H1 e metadados usam
fallbacks funcionais neutros no público sem `PageCopy` approved, e o preview
editorial pode exibir a copy pendente. A Home ganhou `heroImageId` nullable,
com mídia elegível obrigatória quando approved. A proibição geral de campanhas
foi revisada apenas para um `SeasonalBanner` V1 estreito, manual e sem
agendamento, tracking, formulário ou imagem obrigatória; no máximo um banner
ativo aparece após o Hero. O favicon é um derivado quadrado do símbolo circular
preservado da logo fornecida.

### Revisão AQ-WEB-1.1.1 — 09/09/2026

O rótulo público da faixa do modo `editorial-preview` foi simplificado para
“Prévia”, mantendo inalterados o nome técnico do modo, o `noindex`, os dados
visíveis e os bloqueios de release.

### Revisão AQ-WEB-1.1.2 — 09/09/2026

Revisão visual autorizada antes da Fase 2: o rodapé passa a usar composição
mais compacta sem reduzir alvos interativos; `SegmentAnchorNav` alinha seus
links ao container global; e `SeasonalBanner` recebe tom editorial restrito à
paleta segura `paper | red | navy | purple`. A fixture sintética de preview usa
`red`; cores arbitrárias continuam proibidas.
