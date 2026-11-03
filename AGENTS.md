# Aquarela — guia para agentes

Site institucional pequeno, estático, em Astro + Svelte + TypeScript. Conteúdo em
`content/`, imagens originais em `assets/`, arquivos servidos em `public/`.
Hospedagem no Cloudflare Pages; produção na branch `main`.

## Fluxo de trabalho

- O usuário não desenvolve localmente. O agente implementa e valida; o usuário
  revisa pelo preview da branch no Cloudflare e pelo PR.
- Antes de editar, confira o estado do repositório e preserve trabalho existente.
  Use uma branch de tarefa (`feat/`, `fix/`, `refactor/`, `docs/` etc.); prefira
  worktree isolada se o checkout estiver ocupado ou tiver mudanças alheias.
- Quando solicitado um PR, faça commits, push e abra o PR contra `main`. Durante
  a revisão, atualize a mesma branch. Merge requer pedido explícito.
- Use Conventional Commits em inglês. Descreva brevemente o resultado, os checks
  e qualquer pendência; entregue o link do PR e o preview do Cloudflare.
- Não há branch de integração `preview`, fases obrigatórias, contrato versionado,
  hashes de design, escolha de modo editorial ou aprovação por campo de conteúdo.
- O site da branch deve ser o mesmo que chegará à `main`. Há um único build e
  uma única seleção de conteúdo. URLs de desenvolvimento recebem `noindex`.
- Execute diretamente por padrão. Use ferramentas de coordenação ou subagentes
  somente quando a tarefa justificar; não exija provider, modelo ou CLI específicos.

## Implementação

- Siga o pedido atual e os componentes, estilos e padrões já presentes. O material
  em `docs/archive/` é histórico opcional, sem autoridade sobre novas mudanças.
- Mantenha o escopo pequeno. Não acrescente CMS, backend, fluxos de aprovação ou
  infraestrutura sem uma necessidade concreta do pedido.
- Interface e documentação em pt-BR. Preserve acessibilidade, responsividade,
  navegação por teclado e preferência de movimento reduzido.
- Não invente dados do colégio ou dos alunos. Use os materiais fornecidos e
  informe o que falta. Textos e imagens demonstrativos devem ser identificados.
- `content/` define o que o site mostra em todas as branches. Para mudar ou retirar
  informação, edite esses arquivos no PR; não crie filtros de ambiente.
- Nunca inclua segredos ou dados privados no repositório ou no site. Imagens e
  informações pessoais devem estar dentro do escopo solicitado pelo usuário.

## Verificação e entrega

Use `pnpm install --frozen-lockfile` para preparar o ambiente do agente.
Execute checks proporcionais à mudança: `pnpm lint`, `pnpm check`,
`pnpm check-content`, `pnpm test`, `pnpm build` e `pnpm format:check`.
Para mudanças de interação ou layout, use os testes relevantes de `pnpm test:e2e`
e confira o preview em desktop e mobile. Não é necessário repetir uma matriz
completa nem versionar screenshots para toda alteração.

Cloudflare: comando `pnpm build:cloudflare` (alias de `pnpm build`), saída `dist`,
produção `main`, previews nas branches de tarefa. Confira os checks do PR para
obter a URL do deploy. Não peça ao usuário para instalar ou rodar o site localmente.
