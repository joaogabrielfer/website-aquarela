# Arquitetura operacional de agentes

Esta documentação descreve como GPT-5.6 Sol no Codex delega implementação e auditoria para Luna no Codex ou OpenCode Go e para Spark no OpenCode Go. Ela não altera o contrato visual AQ-WEB-1.1.1.

## Responsabilidades

Sol mantém o contexto integral, decide arquitetura/design system, define lotes, protege arquivos compartilhados, revisa o diff e executa a validação final. Luna resolve implementação complexa no provider escolhido pelo usuário para cada lote. Spark executa trabalho direto e barato ou auditoria read-only pelo OpenCode Go.

O fluxo normal é `Usuário → Sol/Codex → Luna (Codex ou OpenCode) ou Spark (OpenCode)`. Somente um Luna lead, escolhido explicitamente pelo Sol para uma tarefa grande, pode criar um segundo nível `spark-*`. Nos perfis OpenCode, todos os demais têm `permission.task: deny`.

## Escolha de perfil

- `luna-builder`: componente compartilhado complexo, UI stateful, bug TypeScript/runtime difícil.
- `luna-lead`: subsistema grande com ao menos duas unidades realmente independentes.
- `spark-page`: rota montada com componentes estabelecidos.
- `spark-css`: CSS/responsive sem decisão estrutural nova.
- `spark-tests`: testes comportamentais e fixtures sintéticas.
- `spark-a11y`: inspeção read-only de acessibilidade.
- `spark-audit`: inconsistências, duplicações e conformidade read-only.

Escalar `Spark → Luna` quando surgir estado complexo, API compartilhada ou julgamento estrutural. Escalar `Luna → Sol` para arquitetura, schema público, decisões globais, conflito normativo ou problema ainda não isolado após uma investigação delimitada.

## Escolha obrigatória antes de Luna

Cada novo lote classificado para Luna exige uma escolha do usuário entre duas franquias:

- **Codex/ChatGPT Plus:** Luna é um subagente nativo do Codex e pode aparecer no painel de agentes do T3 Code.
- **OpenCode Go:** Luna é executado pela CLI OpenCode e consome a franquia Go; dentro de uma tarefa Sol, esse processo externo não aparece como agente nativo no painel do T3 Code.

Antes de iniciar, Sol informa o escopo do lote, recomenda um provider com um motivo curto e pergunta: **“Para este lote Luna (`<escopo>`), você prefere Codex ou OpenCode Go? Recomendo `<provider>` porque `<motivo curto>`.”** A escolha vale apenas para o lote atual. Se o usuário já tiver nomeado explicitamente o provider no próprio pedido, Sol registra essa escolha sem repetir a pergunta.

Nenhum Luna deve ser criado enquanto essa escolha estiver pendente. Spark continua no OpenCode Go salvo nova instrução explícita do usuário.

## Gestão das franquias

Antes de recomendar o provider de um Luna, no início de fases longas e após rate limits, Sol consulta os limites atuais quando a integração permitir. Para Codex, usa a leitura nativa de usage/rate limits do host (ou `account/rateLimits/read` via app-server). Para OpenCode Go, usa `GET https://opencode.ai/zen/go/v1/usage` ou o status oficial equivalente. Segredos ficam somente no processo que consulta o provider; subagentes recebem no máximo um resumo sanitizado.

Sol calcula saldo como `100 - usedPercent` e considera a janela ativa mais restritiva. Acima de 25% o provider está saudável; entre 10% e 25%, baixo; até 10%, crítico; em 0% ou com rate limit ativo, esgotado. Resposta incompleta ou indisponível é estado desconhecido, não zero.

- Codex com até 25% e Go saudável → recomendar OpenCode.
- Go baixo/esgotado e Codex saudável → recomendar Codex.
- Ambos baixos/esgotados → propor lote menor, trabalho local sem subagente ou espera pelo reset.
- Rate limit no meio do lote → interromper novas chamadas, auditar o estado parcial e pedir escolha antes de mudar de provider.

A gestão é semiautomática: a telemetria determina a recomendação, mas a escolha do usuário no portão continua obrigatória. Spark permanece no OpenCode; sem saldo Go, Sol pode propor reclassificar o trabalho para Luna no Codex.

## Commits incrementais dos leads

Sol e `luna-lead` podem criar commits locais durante uma fase de implementação. Builders e Spark não podem. O objetivo é manter pontos de recuperação frequentes sem degradar a atomicidade:

1. commitar cada fatia coesa e verificada de feature;
2. buscar um checkpoint seguro antes de acumular cerca de 30 minutos sem commit;
3. se os 30 minutos chegarem no meio de uma alteração acoplada, terminar a menor fatia funcional e validar antes de commitar — nunca usar commit quebrado ou `WIP` apenas pelo relógio;
4. inspecionar status/diff, fazer staging somente de caminhos próprios, revisar o staged diff e executar os checks relevantes;
5. nunca usar `git add .`/`git add -A` em worktree sujo nem incluir mudanças de outro agente;
6. não fazer `push`, `amend` ou reescrita de histórico sem pedido explícito.

Os títulos seguem o padrão do T3 Code: Conventional Commits em inglês e linguagem simples, no formato `type(scope): concise description`, sem ponto final. Exemplos: `feat(header): implement responsive navigation`, `test(gallery): cover lightbox keyboard behavior` e `fix(content): reject incomplete approved records`. Ao concluir a fase, o lead relata hashes, títulos e checks de cada checkpoint.

## Branches, worktrees e PRs no T3 Code

O T3 pode criar uma nova worktree inicialmente em uma branch temporária e o renomeio automático para um nome legível é best effort. Antes do primeiro commit, o lead inspeciona a branch. Há autorização permanente apenas para renomear uma vez a branch local atual, ainda não publicada/compartilhada e sem commit próprio da tarefa, para uma destas formas:

- `phase/<numero>-<slug>` para trabalho de fase, sempre com preview editorial;
- `editorial/<slug>` para mudança pontual aprovada para preview editorial;
- `<tipo>/<slug>` para build público, com tipo coerente com a preocupação.

Em nova worktree cujo trabalho não pertence a uma fase, o lead pergunta **“Esta tarefa deve usar preview editorial? Recomendo `<sim|não>` porque `<motivo curto>`.”**, salvo quando o pedido já decide o modo. Drafts, dados observed e placeholders justificam recomendar `editorial`; reprodução exata do site público justifica recomendar uma branch comum.

O nome da branch controla o build remoto; o nome do PR não. A branch `preview` é uma integração editorial estável e reservada ao link do cliente: não é branch primária de feature e só recebe merge/fast-forward escolhido pelo usuário. Push, merge, fast-forward, rebase, abertura de PR e renomeio de branch já publicada continuam exigindo autorização explícita.

Commits e títulos de PR usam Conventional Commit em inglês: `type(scope): concise description`. O PR tem uma preocupação principal e corpo com resumo, checks, conteúdo pendente, validações não executadas e URL de preview quando disponível; a base padrão é `main`.

## Roteamento de builds no Cloudflare Pages

O dashboard executa `pnpm build:cloudflare`. O script versionado aplica:

| Branch              | Modo              | Uso                                   |
| ------------------- | ----------------- | ------------------------------------- |
| `main`              | public            | produção estável                      |
| `preview`           | editorial-preview | link estável do cliente               |
| prefixo `phase`     | editorial-preview | fase em desenvolvimento               |
| prefixo `editorial` | editorial-preview | mudança pontual com conteúdo pendente |
| qualquer outra      | public            | preview técnico fiel ao público       |

Todas as branches não-main continuam sendo Preview Deployments do Cloudflare e recebem `noindex`; o modo editorial é uma camada adicional de visibilidade de conteúdo.

## Prompt de delegação

Cada prompt deve conter:

1. objetivo e resultado observável;
2. arquivos de posse exclusiva e arquivos proibidos;
3. referências exatas do contrato;
4. contexto técnico mínimo necessário;
5. critérios de aceite e comandos de verificação;
6. formato de entrega: alterações, verificações, pendências e itens não validados.

O trabalhador escreve no worktree compartilhado. Não deve colar arquivos ou logs extensos na resposta: Sol inspeciona o diff real. Nunca delegar dois trabalhos paralelos que editem o mesmo arquivo.

## Execução direta

Quando o usuário escolhe OpenCode para Luna, ou para qualquer Spark, o wrapper aceita um perfil, um arquivo de prompt e um título opcional:

```bash
scripts/agents/run-agent.sh spark-page /tmp/aquarela-task.md "Rota Ensino"
```

Ele usa `opencode run --format json`, fixa o diretório no repositório e recusa perfis fora da lista aprovada. O modo direto é o padrão: tem menos estado operacional e funciona sem daemon.

Não usar `--auto`. Para continuar, usar `opencode run --session <id>` apenas na mesma tarefa. Uma tarefa nova começa em sessão nova.

## Servidor opcional

Para uma leva de chamadas, um servidor local pode reduzir cold starts:

```bash
export OPENCODE_SERVER_PASSWORD='<valor somente na sessão do shell>'
scripts/agents/start-server.sh 4096
```

Em outro terminal:

```bash
export OPENCODE_SERVER_PASSWORD='<mesmo valor>'
export OPENCODE_ATTACH_URL='http://127.0.0.1:4096'
scripts/agents/run-agent.sh spark-tests /tmp/aquarela-tests.md "Testes de navegação"
```

O servidor fica restrito a `127.0.0.1`; a senha nunca entra no repositório. Se não houver servidor, remover `OPENCODE_ATTACH_URL` e executar diretamente. `serve` é otimização, não dependência.

## Segurança e privacidade

As permissões globais negam acesso externo ao worktree e mutações git destrutivas ou publicadoras. Apenas `luna-lead` sobrescreve a negação global de `git commit` para checkpoints locais; auditores também não têm edição. Isso complementa, não substitui, a revisão do Sol.

Muse Spark 1.3 Contributor permite uso de prompts e respostas para treinamento e não é ZDR. Enviar a Spark somente código destinado ao repositório público, contrato público e fixtures sintéticas. Segredos, credenciais, dados de alunos, conteúdo editorial privado e referências internas de aprovação ficam fora de qualquer prompt Spark.

## Integração pelo Sol

Depois de cada entrega, Sol deve:

1. registrar qual provider/franquia foi escolhido para cada Luna;
2. conferir `git status` e o diff apenas dos arquivos atribuídos;
3. rejeitar alterações fora da posse;
4. validar decisões contra o contrato;
5. executar os portões proporcionais ao risco;
6. criar ou conferir o commit incremental correspondente conforme a política acima;
7. registrar implementação verificada, conteúdo pendente e validações não realizadas.

## Referências operacionais

Consultadas em 09/09/2026; capacidades, modelos e limites podem mudar:

- [CLI OpenCode: `run`, `run --attach` e `serve`](https://dev.opencode.ai/docs/cli/)
- [Agentes OpenCode: modos e `permission.task`](https://opencode.ai/docs/agents)
- [OpenCode Go: modelos, limites e privacidade](https://dev.opencode.ai/docs/go/)
- [Codex: disponibilidade e estimativas por plano](https://chatgpt.com/pt-BR/codex/pricing/)
- [T3 Code: padrão de títulos Conventional Commit](https://github.com/pingdotgg/t3code/blob/main/AGENTS.md)
