# Comparação de entregas — Muse Spark 1.3 e Union Alpha Free

Avaliação específica desta Fase 3, após leitura do diff e execução independente
dos checks pelo lead. Os lotes têm tamanhos e dificuldades diferentes; isto não
é um benchmark geral dos modelos.

## Critérios

1. Correção observável no build estático e casos de borda.
2. Fidelidade ao contrato, acessibilidade e publicação segura de dados.
3. Manutenção: tipos, simplicidade e ausência de abstrações desnecessárias.
4. Testes que exercitam comportamento sem ocultar falhas.
5. Disciplina de escopo, fixtures e arquivos sob posse.
6. Retrabalho necessário durante a integração.

## Resultado por lote

| Modelo                                   | Entrega aceita                                                                                                           | Pontos fortes                                                                                        | Retrabalho do lead                                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Muse Spark 1.3 Contributor / OpenCode Go | Playwright/axe, builds e servidores e2e, cobertura inicial de rotas/menu/modos, ajustes de breadcrumb, metadados e hover | Cobertura ampla, estrutura simples, testes sobre HTML estático real e bom respeito ao escopo público | Restaurar o lockfile para um diff mínimo; retirar a suposição de WhatsApp no build público; aprofundar foco em 1099→1100; adicionar lightbox, paginação, preferências e matriz visual. Uma segunda chamada ficou sem concluir e foi interrompida sem alterações. |
| Union Alpha Free / OpenCode Zen          | Resolução runtime de `interesse`, rejeição de query duplicada e serialização estrita de opções públicas                  | Mudança pequena e coesa, tipos claros, preservação do SSG e nenhum vazamento de metadados editoriais | Integração visual do painel e ampliação dos testes. A lógica entregue não precisou de correção funcional após os testes unitários e e2e.                                                                                                                         |

## Diferença observada

O lote do Union Alpha Free teve melhor precisão por linha alterada e menor
retrabalho. Ele resolveu uma função de borda bem delimitada e manteve a projeção
pública correta. O Muse Spark entregou muito mais superfície e acelerou a criação
da infraestrutura, mas exigiu revisão mais intensa em suposições de conteúdo,
determinismo do lockfile e cobertura dos estados complexos.

Isso não prova superioridade geral do Union: seu lote era menor e mais coeso,
enquanto o Spark recebeu configuração, servidor, testes e CSS. Para próximos
lotes, a evidência desta fase favorece Union Alpha em funções isoladas com casos
de borda e Muse Spark em tarefas amplas e repetitivas de QA, sempre com revisão
do lead antes da integração.

## Disponibilidade observada

Muse Spark 1.3 voltou a funcionar após a reconexão do OpenCode Go e produziu os
lotes aceitos. O saldo Go permaneceu desconhecido porque a telemetria autenticada
não retornou um resumo utilizável nesta sessão.

Union Alpha Free executou o primeiro lote em 17/09/2026. Em 21/09/2026 deixou de
aparecer como rota disponível: novas chamadas retornaram `provider.no-route` /
`Model unavailable` e depois `401 Model union-alpha is not supported`. Não houve
troca silenciosa para uma variante paga; a comparação usa somente a entrega
gratuita já produzida.
