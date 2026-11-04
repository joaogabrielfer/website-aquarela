# Aquarela Colégio e Curso

Site institucional estático em Astro, Svelte e TypeScript, hospedado no Cloudflare Pages.

## Desenvolvimento

O agente implementa em uma branch de tarefa e abre um PR contra `main`. A revisão
visual acontece no preview do Cloudflare. Após o merge, o mesmo conteúdo e layout
vão para produção. Não há branch de integração `preview` nem modo editorial.
Instruções para agentes: [AGENTS.md](./AGENTS.md).

## Conteúdo e estrutura

- `content/`: informações do colégio, textos das páginas, ambientes e aprovações.
- `assets/`: imagens originais fornecidas.
- `public/`: fontes locais, imagens otimizadas e demais arquivos servidos.
- `src/`: páginas Astro, componentes, ilhas Svelte e estilos compartilhados.
- `tests/`: testes unitários e de navegação/acessibilidade.

Os arquivos em `content/` definem diretamente o conteúdo do site em qualquer
branch. Não há estados de aprovação, campos de revisor nem filtros por ambiente.
Use `null`, listas vazias ou textos claramente identificados quando faltar material;
não invente informações. Acompanhe os insumos pendentes em [user-to-do.md](./user-to-do.md).

## Comandos

Requer Node.js 22+ e pnpm na versão de `package.json`. O agente prepara o ambiente;
o usuário não precisa desenvolver localmente.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm preview
```

Verificações: `pnpm lint`, `pnpm check`, `pnpm check-content`, `pnpm test`,
`pnpm format:check` e `pnpm test:e2e`. Os testes de navegador usam um build isolado
com fixtures próprias; essas rotas não entram no build normal.

## Cloudflare Pages

- Produção: `main`, em [website-aquarela.pages.dev](https://website-aquarela.pages.dev).
- Build: `pnpm build:cloudflare` (alias do build único); saída: `dist`.
- Previews habilitados para branches de tarefa; obtenha a URL no check do PR.
- `SITE_URL=https://website-aquarela.pages.dev` na produção; previews usam
  `CF_PAGES_URL`. Branches diferentes de `main` recebem `noindex`.
- `ENABLE_SMOOTH_SCROLL=false` desliga o scroll suave opcional.

O planejamento antigo está em [docs/archive/](./docs/archive/). É referência
histórica, sem contrato, verificação de hashes ou fases obrigatórias.
