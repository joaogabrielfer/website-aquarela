# Arquitetura operacional de agentes

Decisão do usuário em 30/10/2026: o fluxo usa Codex. OpenCode foi retirado
da operação ativa. Esta documentação segue AGENTS.md §5 e não altera o
contrato visual AQ-WEB-1.1.11.

## Execução e responsabilidade

O principal pode implementar diretamente ou delegar a subagentes no Codex,
conforme julgamento de complexidade e benefício da divisão. Não existe escolha
obrigatória de provider por lote nem distribuição fixa entre Luna e Spark.
Arquitetura, contrato, integração, revisão do diff e validação final ficam
sob responsabilidade do principal. Preservar modelos e opções escolhidos pelo
usuário; consultar o catálogo do host antes de delegar.

## Preflight

Antes de editar, ler os cinco arquivos normativos, executar
`sha256sum -c design-contract.sha256` e inspecionar o worktree. Classificar o
modo editorial/público e conferir o prefixo da branch. Perguntar o modo somente
quando necessário conforme AGENTS.md §5.6 e ainda não escolhido pelo usuário.
Comunicar quem implementará e o escopo; não exigir autorização para execução
direta ou para cada subagente Codex.

## Delegação

Cada prompt informa objetivo, contexto mínimo, posse exclusiva de arquivos,
arquivos proibidos, referências normativas, critérios de aceite e verificações.
Paralelizar somente trabalhos sem sobreposição. Usar delegação do host/T3,
respeitando modelo e opções; não criar conversas independentes como substituto.
Subagentes não delegam novamente sem instrução explícita e não fazem mutações
git. O principal inspeciona o diff e valida a integração antes de aceitar.

## Limites e privacidade

Consultar telemetria quando disponível e relevante; ausência de dados significa
saldo desconhecido. Em rate limit, preservar o estado parcial e informar o
impedimento; não trocar de provider silenciosamente. Credenciais, segredos e
informações editoriais privadas nunca entram em prompts de subagentes.

## Git e entrega

Manter a política de commits locais incrementais do principal em AGENTS.md §5.4:
fatias coesas, checks proporcionais, staging explícito e revisão do diff.
Subagentes não fazem commits. Push, publicação e mutações de histórico continuam
exigindo pedido explícito. O renomeio único da branch temporária obedece §5.6.

Branches `phase/*` e `editorial/*` usam preview editorial; as demais usam build
público. `preview` é integração escolhida pelo usuário, nunca branch primária de
feature. Todas as branches não-main recebem noindex no deploy Cloudflare.

Relatar implementação verificada, conteúdo pendente e validações não executadas.

## Arquivos legados

Os perfis em `.opencode/` e wrappers em `scripts/agents/` são históricos e não
devem ser executados como parte do fluxo atual. Não exigem instalação,
autenticação, consulta de franquia ou aprovação de OpenCode.
