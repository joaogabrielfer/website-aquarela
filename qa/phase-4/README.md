# Fase 4 — Finalização do site — Relatório

Lote de integração do POC Lenis e da composição revisada do HeroHome.

Atualização mobile de 24/10/2026 (AQ-WEB-1.1.8): abaixo de 1100 px, o Hero
empilha copy, ações e fotografia 16:9 com gutters e raio de mídia. O degradê
fica exclusivo do desktop, evitando texto sobre detalhes fotográficos.

Atualização de 24/10/2026 (AQ-WEB-1.1.7): removida a máscara duplicada da
fotografia; o overlay cobre toda a altura do Hero, eliminando as bordas
horizontais. Foto desktop deslocada 80 px para a direita. Lenis usa `lerp:0.075`
sem duração fixa e preserva a distância do gesto (`wheelMultiplier:1`).
Verificados: tipos, lint, 72 testes unitários, conteúdo e 148 E2E aprovados
(38 ignorados por modo). A inspeção visual local confirma o fade contínuo;
a sensação em hardware real do usuário ainda depende da avaliação dele.

## 1. Objetivo e baseline

- Objetivo: consolidar o relatório da Fase 4 (integração, ciclo completo e revisão final) a partir das evidências confirmadas pelo lead.
- Branch: `phase/4-finalizacao-site`.
- Baseline anterior: `1cf8b2d docs(qa): record phase four integration`.
- Contrato: AQ-WEB-1.1.6, revisado em 27/09/2026.
- Integridade da baseline validada neste worktree: `sha256sum -c design-contract.sha256` com 5/5 hashes OK (`design-spec.md`, `routes.md`, `components.md`, `responsive.md`, `content-model.md`).
- Escopo deste lote: smooth scroll feature-flagado, HeroHome com mídia 16:9 à direita, variante hero de 2400 px, contrato AQ-WEB-1.1.6 e testes relacionados; sem push, PR ou reescrita de histórico.

## 2. Implementação verificada

- Lenis `1.3.26` habilitado por padrão, desligável no build com `ENABLE_SMOOTH_SCROLL=false`; reduced motion e ponteiro coarse preservam scroll nativo; overlays param/retomam a instância.
- HeroHome usa imagem semântica 16:9 contida à direita no desktop, fade paper para a esquerda, enquadramento completo da escola e faixa contínua `--brand-red`; o arco anterior foi removido.
- Hero possui variante WebP 2400×1350 no srcset; o guard público remove mídia observed, inclusive a nova largura.

Evidência anterior preservada até o HEAD `1cf8b2d`:

- Wrapper `scripts/agents/run-agent.sh` compatível com CLI 2.0.3; smoke test externo retornou `WRAPPER_OK`.
- Referências operacionais de versão alinhadas em `AGENTS.md`, `README.md`, `user-to-do.md`, `docs/agent-architecture.md` e perfis de agente.
- Portões verdes: `format:check`, `astro check`, `check-content`, `lint`, 72 unit tests, builds `public`/`preview` e Playwright.
- `check-release` falha somente pelos seis bloqueios D06 esperados (ver seção 4). Não há outra falha funcional reportada pelo lead.

## 3. Impacto visual

- A fotografia ocupa o fundo do Hero sem o recorte vertical agressivo: no desktop, o quadro 16:9 mostra a escola inteira à direita e uma máscara dissolve sua borda esquerda no paper. O degradê mantém o H1, apoio e CTAs legíveis.
- A faixa vermelha contínua encerra o Hero e cria uma separação mais forte para a seção seguinte.
- O asset de 2400×1350 evita ampliação do WebP de 1600 px em telas largas; não houve reconstrução ou geração artificial da fotografia.

## 4. Conteúdo pendente

O build de release permanece bloqueado pelos seis itens D06, todos editoriais e externos ao código:

1. Identidade/localidade.
2. Telefone ou WhatsApp.
3. Copy principal da Home.
4. Foto principal elegível.
5. Quatro segmentos completos com mídia.
6. Privacidade.

Enquanto pendentes, vale o comportamento contratual: estados vazios honestos (`EmptyState`), só `approved` no build público e preview editorial apenas explícito com faixa "Prévia" e noindex.

## 5. Validações executadas

Confirmadas neste lote pelo lead:

- `format:check`.
- `astro check` — 74 arquivos, zero diagnósticos.
- `check-content`.
- `lint`.
- 72 unit tests.
- Build `public`.
- Build `preview` (`editorial-preview`).
- Playwright — 148 passed / 38 skipped, incluindo interpolação temporal do Lenis, fallback de movimento reduzido/coarse pointer, overlays, âncora e nova mídia do Hero.
- Kill switch `ENABLE_SMOOTH_SCROLL=false` — projeto público com 58 passed / 35 skipped; a ilha não é montada.
- `check-release` — falha somente pelos seis bloqueios D06 listados acima.
- `sha256sum -c design-contract.sha256` — 5/5 OK (revalidado neste lote antes da escrita).
- `prettier --check qa/phase-4/README.md` e `git diff --check` deste lote.

## 6. Validações não executadas

- Safari.
- Firefox.
- Produção (`pages.dev` ou domínio próprio).
- Leitor de tela real.
- Aprovação editorial humana.
- A inspeção visual foi reexecutada em Chromium para a Home nos viewports do lote; isso não substitui Safari, Firefox ou leitor de tela real.

Nada acima deve ser lido como aprovado sem evidência.

## 7. Decisões e pendências

- Lenis foi implementado conforme a decisão explícita deste lote e pode ser desativado com `ENABLE_SMOOTH_SCROLL=false`.
- Pendência normativa (sem editar `design/`): `design/routes.md`, `design/components.md` e `design/responsive.md` ainda contêm rótulos históricos de implementação pendente, apesar do código correspondente já estar implementado. Qualquer ajuste nesses arquivos exige revisão contratual explícita, incremento de versão e atualização do manifesto de hashes.
- Para revisão do responsável: metadados internos permanecem versionados no repositório público. Este relatório não classifica o fato como vazamento confirmado e não propõe remoção sem preservar a rastreabilidade editorial. Decisão sobre retenção, expurgo ou segregação cabe ao responsável, com revisão contratual se aplicável.
- Sem push e sem PR neste lote.
