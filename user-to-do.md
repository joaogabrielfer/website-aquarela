# Aquarela — decisões e próximos materiais

Este documento registra decisões tomadas e o que ainda precisa ser pedido ao
cliente. Não significa aprovação editorial nem autorização de publicação.

## Decisões tomadas

- Contrato vigente: AQ-WEB-1.1.0, congelado em 09/09/2026.
- Sem `PageCopy` approved, o público usa H1 funcional neutro e omite meta
  description; o preview editorial pode mostrar a copy pendente.
- A Home usa `heroImageId` nullable e exige foto elegível quando aprovada.
- Primeiro deploy realizado: modo public em produção, em
  `https://website-aquarela.pages.dev` (branch `main`, indexável). `SITE_URL`
  ainda precisa entrar em um novo build para canonical/sitemap de produção.
- A revisão autoriza apenas um SeasonalBanner V1 manual por vez, sem
  agendamento automático, tracking, formulário ou imagem obrigatória.
- Nome: Aquarela Colégio e Curso (observed).
- Telefone e WhatsApp: +5581982177132 (ambos observed; a confirmação do
  WhatsApp foi registrada nesta conversa, sem aprovação editorial).

## Pedir ao cliente

- Endereço completo, mapa oficial e horários de atendimento.
- Revisão/aprovação da identidade, slogan e copy de cada rota.
- Quatro segmentos de ensino: dados reais, experiências, turnos e fotos.
- Foto oficial do Hero, alt, fonte, autorização e ponto focal.
- Documento de privacidade aprovado.
- Ambientes: nomes, finalidades e fotos autorizadas.
- Atividades: dados completos, condições e fotos opcionais.
- Aprovações: dados de cada conquista e autorização individual de publicação.
- Galeria: álbuns, datas, categorias, legendas, alt e autorizações.
- FAQs reais para ensino, atividades e visita.
- Para um banner sazonal real: texto, período editorial/manual, CTA/destino e
  aprovação. Não prometer agendamento automático.

## Deploy Cloudflare Pages

- Projeto público conectado ao GitHub; branch de produção `main`.
- Build: `pnpm build:cloudflare`; saída: `dist`.
- Em Settings → Builds & deployments, manter `main` como Production branch e
  configurar Preview branch control como todas as branches não-production.
- `NODE_VERSION=22` ou superior nos ambientes Production e Preview.
- `SITE_URL=https://website-aquarela.pages.dev` na produção, seguido de novo
  build.
- Não ativar Functions/Workers. Manter automação de produção desativada até
  `pnpm build:release` deixar de apontar bloqueios editoriais.
- `main` usa build público; `preview`, `editorial*` e `phase*` usam preview
  editorial; as demais branches usam build público. Não definir
  `APP_BUILD_MODE` no dashboard.
- Usar `preview.website-aquarela.pages.dev` como link editorial estável do
  cliente depois do primeiro push da branch `preview`.

## Fluxo de branches e PRs

- Fase formal: `phase/<numero>-<slug>`, com preview editorial automático.
- Mudança pontual fora de fase: o agente pergunta se deve usar preview
  editorial e recomenda conforme a necessidade de drafts/placeholders.
- Mudança pontual editorial: `editorial/<slug>`; mudança pública: branch
  Conventional correspondente, como `feat/<slug>` ou `fix/<slug>`.
- `preview` recebe por merge/fast-forward somente o que for escolhido para o
  cliente; `main` recebe somente fases/features encerradas.
- Commits e títulos de PR: Conventional Commit em inglês. Push, merge e abertura
  de PR continuam dependendo de autorização explícita.

## Aprovação

Cada registro approved precisa de `source`, `reviewedAt` real e `reviewedBy`
fornecido pelo responsável. O agente não inventa aprovações e metadados de
revisão não chegam ao HTML público.
