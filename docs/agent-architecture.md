# Arquitetura operacional de agentes

Esta documentação descreve como GPT-5.6 Sol no Codex delega implementação e auditoria para Luna no Codex ou OpenCode Go e para Spark no OpenCode Go. Ela não altera o contrato visual AQ-WEB-1.0.0.

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

As permissões globais negam acesso externo ao worktree e mutações git destrutivas ou publicadoras. Auditores também não têm edição. Isso complementa, não substitui, a revisão do Sol.

Muse Spark 1.3 Contributor permite uso de prompts e respostas para treinamento e não é ZDR. Enviar a Spark somente código destinado ao repositório público, contrato público e fixtures sintéticas. Segredos, credenciais, dados de alunos, conteúdo editorial privado e referências internas de aprovação ficam fora de qualquer prompt Spark.

## Integração pelo Sol

Depois de cada entrega, Sol deve:

1. registrar qual provider/franquia foi escolhido para cada Luna;
2. conferir `git status` e o diff apenas dos arquivos atribuídos;
3. rejeitar alterações fora da posse;
4. validar decisões contra o contrato;
5. executar os portões proporcionais ao risco;
6. registrar implementação verificada, conteúdo pendente e validações não realizadas.

## Referências operacionais

Consultadas em 09/09/2026; capacidades, modelos e limites podem mudar:

- [CLI OpenCode: `run`, `run --attach` e `serve`](https://dev.opencode.ai/docs/cli/)
- [Agentes OpenCode: modos e `permission.task`](https://opencode.ai/docs/agents)
- [OpenCode Go: modelos, limites e privacidade](https://dev.opencode.ai/docs/go/)
- [Codex: disponibilidade e estimativas por plano](https://chatgpt.com/pt-BR/codex/pricing/)
