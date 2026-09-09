# AGENTS.md — Website Aquarela

Guia operacional para agentes que trabalham neste repositório. Lido antes de qualquer tarefa.

## 1. Autoridade normativa

A fonte normativa é o **contrato AQ-WEB-1.1.2** (referido pelo usuário como "contrato da Astra" — Astra é o modelo autor do design), congelado em 09/09/2026, nos cinco arquivos de `design/`. Ordem obrigatória de leitura antes de programar:

1. `design/design-spec.md` — escopo, tokens, variantes globais, qualidade.
2. `design/routes.md` — rotas, ordem de seções, copy funcional, destinos.
3. `design/components.md` — anatomia, estados, teclado, foco, menu, cards, lightbox.
4. `design/responsive.md` — breakpoints, valores exatos, matriz de revisão visual.
5. `design/content-model.md` — schemas, aprovação, preview, ausência de dados, bloqueios.

Verificar a integridade da baseline antes de começar:

```bash
sha256sum -c design-contract.sha256
```

- Cada arquivo é autoridade no seu domínio. Contradição entre arquivos: **registrar e pedir resolução**, nunca escolher silenciosamente.
- `DESIGN.md` e `prototipo-figma.md` são histórico/estudo, subordinados ao contrato. O Figma é referência visual parcial; **não gastar cota Figma** procurando frames que o contrato diz não existir (Ensino, Visite, rodapé, mobile, estados).
- Alterações de escopo/aparência exigem revisão explícita do contrato, incremento de versão e atualização do manifesto de hashes. Não editar `design/` para justificar retrospectivamente uma divergência.

## 2. Regras inegociáveis para qualquer agente

1. **Não inventar dados.** Sem fotos, alunos, aprovações, depoimentos, endereços, horários ou instalações presumidos. Dados ausentes → estados vazios honestos (`EmptyState`) conforme `content-model.md` D06.
2. **Escopo fechado.** Não implementar NewsCard, TeacherCard, formulários, filtros, busca, campanhas fora do SeasonalBanner V1 autorizado, depoimentos, vídeo, tour, feed social, chatbot nem qualquer feature P1 do estudo. Sem CMS, sem backend, sem dependência de Figma em runtime.
3. **Só `approved` entra no build público.** Metadados de revisão (`reviewedAt`, `reviewedBy`, fonte) nunca são serializados para o browser — usar projeção pública estrita. O agente nunca preenche campos de aprovação fingindo revisão humana.
4. **Preview editorial é explícito** (flag de ambiente, faixa "Prévia", noindex). `NODE_ENV=development` sozinho não autoriza exibir drafts. Build de release recusa modo preview. Fixtures de QA são sintéticas, marcadas e isoladas do build público.
5. **Tokens exatos** de `design-spec.md` §3–4 (cores, espaços, raios, tipografia). Não usar paleta padrão de biblioteca. Fonte Outfit em WOFF2 local (baixar do repositório oficial google/fonts, OFL) com licença preservada em `public/fonts/`; sem requisição de fonte a terceiros em runtime.
6. **Idioma: pt-BR** em toda a interface, copy funcional e documentação do projeto. Copy funcional (navegação, CTAs, EmptyStates, controles) está congelada em `routes.md`/`components.md`; não reescrever.
7. **Acessibilidade é critério de aceitação**: contraste ≥4,5:1 em texto normal, alvos ≥44×44 px, anel de foco global, um H1 por rota, `lang="pt-BR"`, skip link, teclado completo (menu, lightbox, paginação).
8. **Não publicar automaticamente.** Existe autorização permanente apenas para commits locais incrementais feitos por agentes lead durante fases de implementação, conforme §5.4, e para o renomeio único da branch local temporária de uma nova worktree T3 antes do primeiro commit, conforme §5.6. `push`, publicação, outras trocas ou renomeios de branch, `reset`, `rebase`, `merge`, `cherry-pick` e demais mutações de histórico continuam exigindo pedido explícito do usuário.
9. **Relatórios separam**: (1) implementação verificada, (2) conteúdo pendente, (3) validações não executadas. Não marcar item como aprovado sem evidência.
10. **Repositório público no GitHub.** Nunca commitar segredos, tokens ou dados privados; o modelo de conteúdo já veda dados de revisão no output público — manter essa disciplina também em config e CI.

## 3. Stack e hosting — CONFIRMADA (08/09/2026)

**Astro 5 (SSG, output estático) + ilhas Svelte 5 + TypeScript strict + Zod + pnpm.**

| Requisito do contrato                             | Como a stack atende                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Geração estática, HTML indexável, sem backend     | Astro é SSG-first; zero JS por padrão                                      |
| Modelo de conteúdo tipado com validação (D01–D07) | Content collections + schemas Zod (`Editorial<T>`, `Review`, `Media`)      |
| Projeção pública sem metadados de revisão         | Camada `src/lib/content` projeta só campos usados na UI                    |
| Imagens responsivas com variantes e dimensões     | `astro:assets` gera srcset/tamanhos em build (AVIF/WebP, sem serviço pago) |
| Interações (menu, lightbox, paginação)            | Ilhas Svelte 5 hidratadas sob demanda                                      |
| Política de foco/scroll em navegação              | MPA: navegador trata nativamente topo/hash/histórico                       |
| Sitemap, canonical, noindex de preview, 404 real  | `@astrojs/sitemap` + `404.astro` → `404.html`                              |

**Hosting: Cloudflare Pages (plano gratuito), site 100% estático — sem Functions/Workers/R2.**

- Limites relevantes do free: 25 MiB **por arquivo**, 20.000 arquivos por deploy, 500 builds/mês, banda ilimitada para assets estáticos. Imagens são otimizadas em build (ficam muito abaixo de 25 MiB); originais pesados ficam no repo e não vão para o deploy.
- `404.html` é servido pelo Pages com status 404 nativamente. Headers de cache/segurança via arquivo `public/_headers` (versionado, sem segredos).
- Domínio provisório: `https://<projeto>.pages.dev`. `SITE_URL` é variável de build pública (não secreta); canonical/sitemap/OG derivam dela. Ao comprar o `.com.br`: adicionar Custom Domain no dashboard e atualizar `SITE_URL` (seção 9).
- Nenhum adapter SSR é necessário; deploy = diretório `dist/` gerado por `pnpm build`.

**Movimento:** transições de 160/200 ms e scroll suave **nativo de âncoras** (`scroll-behavior: smooth` apenas em `@media (prefers-reduced-motion: no-preference)`), conforme design-spec §4. Biblioteca de smooth scroll inercial (Lenis) está **proposta, pendente de decisão do usuário** — se aprovada, entra como POC ao final (flag de build), com guards: desligada em reduced-motion e touch, `stop()` quando menu/lightbox abrem, validação de âncoras/teclado. Proibidos pelo contrato: parallax, scroll-jacking, reveal-on-scroll, conteúdo que dependa de JS para aparecer.

## 4. Arquitetura planejada

```text
├─ design/               # contrato congelado — NÃO editar
├─ assets/               # originais fornecidos (logo intacta)
├─ content/              # dados editoriais com Review (draft/observed/approved)
│  ├─ school.yaml        # identidade, contatos, endereço
│  ├─ pages/             # PageCopy por rota
│  ├─ segments.yaml      # 4 etapas de ensino
│  ├─ environments.yaml  # ambientes do espaço
│  ├─ activities.yaml    # extracurriculares
│  ├─ approvals.yaml     # aprovações
│  ├─ albums/            # álbuns da galeria
│  └─ privacidade.md     # documento editorial
├─ public/
│  ├─ fonts/             # Outfit WOFF2 + licença OFL
│  ├─ brand/             # derivado da logo (margens ajustadas, pixels preservados)
│  └─ _headers           # headers de cache/segurança do Cloudflare Pages
├─ src/
│  ├─ styles/            # tokens.css (fonte única de verdade), global.css
│  ├─ lib/               # projeção pública de conteúdo, URLs (tel:/wa.me), datas pt-BR
│  ├─ components/        # apresentacionais (.astro): Header, Footer, cards, grids…
│  ├─ islands/           # interativos (.svelte): MobileMenu, Lightbox, LoadMore
│  ├─ layouts/           # PageShell (skip link → header → main → footer)
│  └─ pages/             # 7 rotas + galeria/[slug] + privacidade + 404
├─ scripts/              # check-content (validação) e check-release (bloqueios de lançamento)
├─ tests/                # unit (Vitest) e e2e/a11y/visual (Playwright)
└─ qa/                   # screenshots e relatórios da matriz B05 — VERSIONADOS no git
```

Pipeline de conteúdo: `content/` → schemas Zod → `check-content` → filtro `approved` + projeção pública → páginas. Modos de build: `public` (padrão), `editorial-preview` (explícito, com faixa e noindex), `release` (recusa preview e aplica bloqueios de lançamento D06).

Ilhas compartilham estado via store único (uma instância de menu/lightbox por vez; nunca dois dialogs sobrepostos). Primeira leva de itens de grades paginadas é renderizada no servidor; a ilha anexa lotes mantendo foco e anunciando via status `polite`.

### Modos de build e ambientes de deploy (decisões do usuário, 08–09/09/2026)

Dois eixos ortogonais: **modo editorial** (dados) e **ambiente de deploy** (URL/índice):

| Modo de build       | Dados exibidos                         | Faixa visual | robots    |
| ------------------- | -------------------------------------- | ------------ | --------- |
| `public` (padrão)   | só `approved`                          | não          | indexável |
| `editorial-preview` | `approved` + `observed` + placeholders | "Prévia"     | noindex   |
| `release`           | só `approved` + bloqueios D06          | não          | indexável |

- Local: `pnpm dev` e `pnpm build` = `public`; `pnpm build:preview` = `editorial-preview`; `pnpm build:release` = `release`.
- Cloudflare usa `pnpm build:cloudflare`, que lê `CF_PAGES_BRANCH`: `main` e branches comuns executam build `public`; `preview` e qualquer branch cujo nome comece por `editorial` ou `phase` executam `editorial-preview`.
- `main` é a produção estável em `website-aquarela.pages.dev`. `preview` é a integração editorial estável enviada ao cliente. `phase/*` representa uma fase de trabalho e `editorial/*` uma mudança pontual que precisa mostrar conteúdo pendente. As demais branches geram previews técnicos no modo público.
- Toda branch não-main recebe URL de preview `<hash>.<projeto>.pages.dev` e alias estável derivado do nome. O Pages injeta `CF_PAGES_BRANCH` e `CF_PAGES_URL`; o build usa a URL real do preview em canonical/OG e adiciona noindex.
- `preview` não é branch de desenvolvimento primária nem recebe conteúdo automaticamente: o usuário escolhe quais branches integrar nela. Merge/fast-forward e push continuam exigindo autorização explícita. Preview editorial nunca vai para a `main`.

## 5. Arquitetura de agentes — Sol no Codex + OpenCode Go

O agente principal é **GPT-5.6 Sol no Codex**. Sol conserva o contexto do projeto, decide arquitetura e design system, decompõe o trabalho, integra os resultados e faz a revisão final. Luna pode ser criado nativamente pelo Codex ou executado pelo OpenCode Go, sempre após escolha do usuário para o lote. Spark é um trabalhador OpenCode delimitado. Nenhum agente delegado substitui o lead.

OpenCode Go tem limites de **US$ 12/5h, US$ 30/semana e US$ 60/mês**, medidos em valor. Estimativas publicadas em 09/09/2026: GPT-5.6 Luna ≈2.050 requests/5h e Muse Spark 1.3 Contributor ≈45.300 requests/5h. São referências de capacidade, não cotas garantidas; a quantidade real depende dos tokens e pode mudar.

| Trabalho                                                          | Responsável padrão | Escalação                                          |
| ----------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| Plano geral, arquitetura e decisões de design system              | Sol                | não delegar decisão                                |
| Integração e revisão final de código/design                       | Sol                | —                                                  |
| Componentes compartilhados complexos                              | Luna               | Sol se houver decisão transversal                  |
| UI stateful difícil e bugs TypeScript/runtime estranhos           | Luna               | Sol se não houver causa isolada                    |
| Páginas diretas a partir de componentes estabelecidos             | Spark              | Luna se exigir julgamento estrutural               |
| CSS e responsivo                                                  | Spark              | Luna para composição acoplada/complexa             |
| Testes e fixtures sintéticas                                      | Spark              | Luna se a infraestrutura de teste estiver quebrada |
| Inspeção de acessibilidade e busca de inconsistências/duplicações | Spark read-only    | Sol decide correções transversais                  |

Os perfis usados quando o provider escolhido é OpenCode ficam em `.opencode/agents/`:

- `luna-builder`: implementação complexa, sem permissão de criar agentes.
- `luna-lead`: subsistema excepcionalmente grande; pode criar somente agentes `spark-*`.
- `spark-page`, `spark-css`, `spark-tests`: implementação barata e delimitada; não criam agentes.
- `spark-a11y`, `spark-audit`: inspeção read-only; não criam agentes.

### 5.1 Hierarquia e nesting

Hierarquia normal: `Usuário → Sol/Codex → Luna (Codex ou OpenCode) ou Spark (OpenCode)`. Só existe um segundo nível quando Sol classifica explicitamente uma tarefa como grande e decomponível: `Sol → Luna lead → spark-*`. Não há nenhum outro nesting. Se Luna estiver no Codex, os Spark ainda são iniciados pela CLI OpenCode e não ganham visibilidade nativa no painel de agentes do T3 Code.

Escala de julgamento: `Spark → Luna → Sol`. Escalar por natureza da decisão, não apenas porque uma primeira tentativa falhou. Contradição normativa, alteração de schema público, tokens globais, shell, projeção de conteúdo ou convenção compartilhada volta diretamente ao Sol; se afetar escopo/aparência do contrato, volta ao usuário.

### 5.2 Portão obrigatório de provider para Luna

Antes de criar qualquer Luna, Sol deve perguntar ao usuário qual franquia usar **para aquele lote**: `Codex/ChatGPT Plus` ou `OpenCode Go`. A pergunta inclui em uma frase o escopo do Luna e a recomendação do Sol, considerando limites atuais, privacidade e necessidade de visibilidade no T3 Code. Nenhum Luna começa antes da resposta.

Formato mínimo: **“Para este lote Luna (`<escopo>`), você prefere Codex ou OpenCode Go? Recomendo `<provider>` porque `<motivo curto>`.”**

- `Codex`: consome a franquia Codex/Plus e o Luna nativo pode aparecer no painel de agentes do T3 Code.
- `OpenCode Go`: consome a franquia Go; quando iniciado pela CLI dentro da tarefa Sol, não aparece como agente nativo no painel do T3 Code.
- A escolha vale somente para o lote descrito, não cria preferência permanente.
- Se o pedido atual do usuário já nomear explicitamente o provider daquele Luna, Sol registra a escolha e não pergunta de novo.
- Spark permanece no OpenCode Go, salvo instrução explícita posterior do usuário.

### 5.3 Gestão de limites e recomendação de provider

Sol é responsável por observar as duas franquias e considerar o menor saldo relevante entre as janelas ativas. Antes do portão de provider de cada Luna, no início de uma fase longa e depois de qualquer erro de rate limit, deve consultar os dados atuais quando a integração estiver disponível:

- **Codex/ChatGPT Plus:** usar a leitura nativa de usage/rate limits exposta pelo host; em integrações via Codex app-server, usar `account/rateLimits/read`.
- **OpenCode Go:** usar o endpoint autenticado de usage da conta (`GET https://opencode.ai/zen/go/v1/usage`) ou o status oficial equivalente exposto pela CLI/serviço.

Credenciais nunca entram em prompts, logs, arquivos do repositório ou contexto de subagentes. Sol lê os dados diretamente e repassa somente um resumo sanitizado: provider, janela, percentual restante e horário de reset. Campo ausente ou falha de consulta significa **desconhecido**, nunca saldo zero nem saldo saudável.

| Menor saldo restante nas janelas aplicáveis | Estado       | Conduta padrão                                                                              |
| ------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| `> 25%`                                     | saudável     | provider elegível normalmente                                                               |
| `> 10%` e `≤ 25%`                           | baixo        | preservar para tarefas de maior valor; recomendar a outra franquia se estiver mais saudável |
| `> 0%` e `≤ 10%`                            | crítico      | não iniciar lote volumoso; recomendar troca ou espera                                       |
| `0%`, bloqueado ou rate limit ativo         | esgotado     | não iniciar novas chamadas; informar o reset e oferecer provider alternativo                |
| consulta indisponível                       | desconhecido | declarar a falta de telemetria e decidir pelo escopo/custo, sem alegar disponibilidade      |

- Percentual restante = `100 - usedPercent` quando a API fornece consumo. Se houver janelas de 5h, semanal e mensal, prevalece a mais restritiva.
- Se Codex ficar com `≤ 25%` e OpenCode estiver saudável, Sol recomenda OpenCode no portão da §5.2. Se OpenCode estiver baixo/esgotado e Codex estiver saudável, recomenda Codex.
- A troca é **semiautomática**: Sol calcula e recomenda, mas não muda a franquia de Luna silenciosamente; a resposta do usuário no portão autoriza o lote. Uma escolha anterior não autoriza lotes futuros.
- Spark continua exclusivo do OpenCode. Se Go estiver esgotado, Sol pausa o Spark e pode propor executar o trabalho como Luna no Codex, sempre passando pelo portão.
- Se um limite acabar no meio da execução, o agente para novas chamadas, preserva e audita o estado parcial, informa o que está verificável e pede escolha antes de retomar em outro provider.
- Se ambas as franquias estiverem baixas ou esgotadas, Sol propõe reduzir o lote, aguardar o reset ou continuar localmente apenas com trabalho que não consuma agentes externos.

### 5.4 Commits incrementais durante implementação

**Agentes lead** significam Sol e um perfil `luna-lead` explicitamente ativado. Eles têm autorização permanente para criar commits **locais** durante fases de implementação; Luna builder e todos os Spark continuam proibidos de commitar. Essa autorização não inclui `push` nem reescrita de histórico.

1. Criar um commit após cada fatia coesa e verificável de feature — por exemplo foundation, projeção de conteúdo, componente compartilhado, ilha, rota ou conjunto de testes correspondente.
2. Usar **aproximadamente 30 minutos como limite de trabalho ainda não salvo em commit**, não como motivo para quebrar atomicidade. Ao atingir esse ponto, terminar a menor fatia coerente, executar os checks relevantes e commitar. Nunca criar commit sabidamente quebrado, parcial ou apenas `WIP` para obedecer ao relógio.
3. Antes de commitar: conferir `git status --short` e o diff; adicionar somente caminhos próprios e revisados; conferir `git diff --cached`; executar validação proporcional ao escopo. Em worktree sujo, nunca usar `git add .` ou `git add -A`.
4. Se outro agente estiver escrevendo no mesmo worktree, o lead só commita numa janela coordenada e com staging explícito. Alteração alheia, sobreposição ou autoria incerta bloqueia o commit e volta ao Sol para integração.
5. O título segue o estilo de títulos gerados pelo T3 Code: Conventional Commit em inglês, linguagem simples, `type(scope): concise description`, tudo em minúsculas salvo nomes próprios, sem ponto final. Tipos usuais: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf` e `style`.
6. Exemplos: `feat(content): add public editorial projection`, `feat(header): implement responsive navigation`, `test(gallery): cover lightbox keyboard behavior`, `fix(content): reject incomplete approved records`.
7. Cada commit cobre uma única preocupação e deixa o checkout em estado compreensível e recuperável. Corpo opcional também em inglês; registrar checks relevantes quando isso ajudar. Não usar `--amend` sem pedido explícito.
8. O relatório da fase lista hashes e títulos dos commits, checks executados e qualquer intervalo que ainda não tenha checkpoint seguro. Commit não equivale a aprovação editorial nem a conclusão da fase.

### 5.5 Protocolo de delegação

1. Sol verifica `sha256sum -c design-contract.sha256` e inspeciona o estado atual antes de delegar.
2. Se a tarefa pede Luna, Sol cumpre o portão da seção 5.2 antes de iniciar o agente.
3. Cada prompt informa objetivo, arquivos de posse exclusiva, arquivos proibidos, trechos normativos relevantes, critérios de aceite e comandos de verificação. Subagentes começam com contexto novo.
4. Paralelização só ocorre entre tarefas com arquivos exclusivos. Nunca dois agentes editam o mesmo arquivo; arquivos compartilhados são integrados sequencialmente pelo Sol ou por um único Luna.
5. O trabalhador não faz `commit`, `push`, `reset`, troca de branch nem outra mutação git. A única exceção é `luna-lead`, que pode criar commits locais seguindo integralmente a §5.4. Todos entregam um resumo curto com alterações, verificações e pendências.
6. Sol lê o diff real, executa os portões adequados e decide aceitar, corrigir, escalar ou reverter. Relato de subagente não é evidência suficiente.
7. Para trabalhadores OpenCode, `opencode run` é a interface padrão. `opencode serve` é somente uma otimização opcional para uma leva de chamadas via `run --attach`; indisponibilidade do servidor não bloqueia execução direta.
8. Não usar `--auto`. Sessão só é continuada para a mesma tarefa; trabalhos distintos recebem sessões novas.
9. Muse Spark 1.3 Contributor pode usar prompts e respostas para treinamento e não é ZDR. Spark recebe apenas código destinado ao repositório público, contrato público e fixtures sintéticas — nunca segredos, credenciais, dados de alunos, conteúdo editorial privado ou referências internas de aprovação.

O protocolo executável e os exemplos estão em `docs/agent-architecture.md` e `scripts/agents/`.

### 5.6 Branches, worktrees T3 e pull requests

Ao iniciar uma thread em uma **nova worktree** pelo T3 Code, o lead confere a branch antes do primeiro commit. O T3 pode começar com um nome temporário e seu renomeio automático é best effort; por autorização permanente e restrita do usuário, o lead pode renomear **uma vez** a branch local atual se ela ainda não tiver sido publicada nem compartilhada e ainda não possuir commit próprio da tarefa:

- trabalho pertencente a uma fase formal → `phase/<numero>-<slug>` e preview editorial;
- trabalho fora de fase com preview editorial aprovado → `editorial/<slug>`;
- trabalho fora de fase sem preview editorial → `<tipo>/<slug>`, usando `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build` ou `ci` conforme a preocupação principal.

Para trabalho fora de uma fase, antes de renomear a branch ou implementar, perguntar: **“Esta tarefa deve usar preview editorial? Recomendo `<sim|não>` porque `<motivo curto>`.”** A pergunta é dispensada se o pedido atual já escolher explicitamente o modo. Recomendar editorial quando a avaliação depender de draft/observed/placeholders; recomendar build público quando o objetivo for reproduzir exatamente o que visitantes receberão. Se a branch já estiver publicada ou possuir trabalho compartilhado, não renomear sem autorização específica.

A branch `preview` é reservada à integração do que o usuário decidiu mostrar ao cliente. Não iniciar feature diretamente nela. Atualizá-la por merge ou fast-forward somente com autorização explícita e sem presumir que toda mudança de fase deve ser mostrada.

Commits seguem §5.4. Quando o usuário pedir abertura de PR, o título também usa Conventional Commit em inglês (`type(scope): concise description`) e descreve a preocupação principal; o corpo separa resumo, checks, conteúdo pendente, validações não executadas e URL de preview quando existir. A base é `main`, salvo instrução explícita diferente. Criar PR e fazer push continuam dependendo de pedido explícito.

## 6. Fases de trabalho

- **Fase 0 (Sol)** — verificação do contrato, decisão de stack/hosting e arquitetura operacional.
- **Fase 1 (Luna, sequencial; Sol decide e revisa)** — scaffold Astro+Svelte, tokens.css, fontes locais (Outfit OFL), derivado da logo, schemas Zod + `check-content`/`check-release`, projeção pública, conteúdo inicial = inventário D05 como `observed`, PageShell/Header/Footer, modos de build, `public/_headers`. Portão: build vazio passa + lint/typecheck verdes.
- **Fase 2 (Luna/Spark por complexidade, lotes com posse exclusiva)** —
  - Lote A: primitives (Button/TextLink/IconButton, SectionHeading, Breadcrumb, PageIntro, EmptyState/AssetPlaceholder).
  - Lote B: cards e grades (Segment/Activity/Approval/Album/Environment cards; AlbumGrid/PhotoGrid/GalleryPreview).
  - Lote C: ilhas (MobileMenu, Lightbox, LoadMore) + HeroHome/MediaText/VisitCTA/ContactPanel/FAQ.
  - Lote D: rotas (`/`, `/ensino`, `/nosso-espaco`, `/aprovacoes`, `/atividades`, `/galeria`, `/galeria/[slug]`, `/visite`, `/privacidade`, 404) com todos os estados vazios D06.
- **Fase 3 (Spark testa/audita; Sol revisa)** — e2e de comportamento (menu/Esc/foco, deep link + refresh, lightbox e retorno de foco, paginação preservando itens e foco, contatos condicionais, query inválida, slug desconhecido, 404), matriz visual B05 com evidências em `qa/`, axe-core, revisão cruzada + tabela de correspondência de componentes.
- **Fase 4 (Sol)** — integração, ciclo completo (lint → typecheck → check-content → testes → build), correção de inconsistências, revisão final e relatório em três partes. POC Lenis (se aprovada) entra aqui, feature-flagada.
- **Fase 5 (usuário + Sol)** — deploy no Cloudflare Pages (seção 9), validação em produção do `pages.dev`.

## 7. Comandos

Comandos Fase 1: `pnpm dev`, `pnpm build`, `pnpm build:preview`, `pnpm build:release`, `pnpm preview`, `pnpm check`, `pnpm check-content`, `pnpm check-release`, `pnpm test`, `pnpm lint`, `pnpm format` e `pnpm format:check`.

## 8. QA e evidências

Matriz obrigatória em `design/responsive.md` B05 (7 páginas em 390×844 e 1440×900; breakpoints 1099/1100; 320×700 e 1920×1080; lightbox em retrato/paisagem; zoom 200%; movimento reduzido; estados sem dados). Evidências em `qa/` **versionadas no git** (decisão do usuário, 08/09/2026). Captura de tela não substitui teste manual de foco, menu e links.

## 9. Deploy no Cloudflare Pages — checklist do usuário

Executado pelo usuário no dashboard (o agente não tem acesso); nada disso envolve segredos:

1. **Criar projeto Pages** conectado ao repositório público do GitHub.
2. **Build settings:** comando `pnpm build:cloudflare`, diretório de saída `dist`, variável de ambiente `NODE_VERSION=22` (ou superior) em Production e Preview.
3. **Branch de produção = `main`; Preview branch control = todas as branches não-production.** `preview`, `editorial*` e `phase*` usam preview editorial; as demais usam build público. Todos os deploys não-main continuam noindex e usam `CF_PAGES_URL` sem configuração extra (seção 4).
4. **Variável `SITE_URL` (produção)**: `https://<projeto>.pages.dev`; é pública (vai para canonical/sitemap/OG), não é segredo. Só é necessária para a `main`.
5. **Não ativar** nenhuma integração de Functions/Workers — o site é 100% estático.
6. **Domínio próprio (.com.br), quando comprado:** Custom Domain no dashboard → seguir o assistente de DNS → atualizar `SITE_URL` → rebuild. O `sitemap.xml` e canonicals se regeneram sozinhos.
7. **HTTPS/TLS** é automático no Pages; nenhuma configuração extra.
