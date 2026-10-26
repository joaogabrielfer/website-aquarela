# Inclusão de fotos — 26/10/2026

Branch: `editorial/add-school-photos`. Implementação: Luna no Codex; revisão e integração: Sol.

## Implementação verificada

- Sete fotografias autorizadas: duas da piscina, duas da quadra e três de salas com alunos.
- Piscina e Quadra coberta acrescentadas a Nosso Espaço. Fotos de sala anexadas aos lightboxes existentes, sem atribuir séries ou etapas.
- Variantes WebP responsivas; HEIC convertidos localmente sem retoque. Fontes externas preservadas.
- Contrato íntegro; lint, check-content, Astro check, Prettier e diff --check passaram. 72 testes unitários passaram.
- Builds editorial-preview e público passaram. Novas mídias vinculadas no HTML editorial e ausentes do HTML público.
- Nosso Espaço revisado em 1440×900 e 390×844, sem overflow horizontal. Capturas parciais dos novos cards neste diretório.
- Lightbox da piscina: abertura, carregamento, ArrowRight para 2 de 2, Escape e restauração de foco no acionador verificados.
- Gerador preserva regeneração de variantes existentes quando a origem muda.

## Conteúdo pendente

Autorização de uso registrada; registros continuam observed, sem reviewedAt/reviewedBy inventados. Revisão editorial formal e confirmação da associação das salas com alunos continuam pendentes antes de publicação pública. Pilates não incluído.

## Validações não executadas

Matriz visual completa B05, auditoria axe, suite e2e completa e validação em produção não repetidas neste lote. Nenhum push ou deploy. Capturas não são evidência de aprovação editorial.
