# Website Aquarela

Documentação para o site institucional do Aquarela Colégio e Curso.

## Desenvolvimento

Pré-requisitos: Node.js >=22 e pnpm 11.3. Instale as dependências com `pnpm install`.

- `pnpm dev` — servidor local
- `pnpm build` / `pnpm preview` — build público e pré-visualização
- `pnpm build:preview` — prévia editorial explícita
- `pnpm build:release` — verifica bloqueios editoriais e tenta o build de release
- `pnpm check` — verificação Astro/TypeScript
- `pnpm check-content` — validação dos dados editoriais
- `pnpm check-release` — bloqueios de lançamento
- `pnpm test` — testes unitários
- `pnpm lint` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier

## Contrato congelado para implementação

**AQ-WEB-1.0.0**, de 08/09/2026. Começar por estes cinco arquivos, nesta ordem:

1. [design/design-spec.md](./design/design-spec.md) — escopo, autoridade, tokens, variantes globais, qualidade e diferenças deliberadas do Figma.
2. [design/routes.md](./design/routes.md) — rotas, ordem de seções, copy funcional e destinos de todas as ações.
3. [design/components.md](./design/components.md) — anatomia, estados, teclado, foco, menu, cards e lightbox.
4. [design/responsive.md](./design/responsive.md) — breakpoints, valores exatos e matriz de revisão visual.
5. [design/content-model.md](./design/content-model.md) — schemas, origem/aprovação, preview, dados ausentes e bloqueios de publicação.

Os hashes da baseline estão em [design-contract.sha256](./design-contract.sha256). Verificar no diretório do projeto com `sha256sum -c design-contract.sha256`. O manifesto detecta alterações posteriores; não é certificação da implementação nem trava de filesystem. Revisões autorizadas precisam atualizar versão e manifesto.

## Arquitetura de agentes

O projeto usa GPT-5.6 Sol no Codex como lead de arquitetura, integração e revisão final. Implementações delegadas usam perfis Luna e Spark via OpenCode Go, com nesting restrito e posse exclusiva de arquivos. O protocolo, os limites de dados do Spark Contributor e os comandos `opencode run`/`serve` estão em [docs/agent-architecture.md](./docs/agent-architecture.md).

## Referências históricas e assets

- [DESIGN.md](./DESIGN.md) — estudo anterior: pesquisa, crítica do protótipo, informações públicas e mapa expandido de referências Figma. Subordinado ao contrato congelado.
- [prototipo-figma.md](./prototipo-figma.md) — registro histórico do que foi criado na primeira etapa; não substitui as recomendações posteriores do DESIGN.md.
- [Logo original](./assets/logo-aquarela.PNG) — cópia sem alterações do arquivo fornecido; o original permanece em Downloads.
- [Arquivo no Figma](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA) — exploração visual parcial das cinco telas iniciais.

Fotos, oferta detalhada, dados de aprovações e informações complementares ainda precisam ser fornecidos ou confirmados pelo colégio. O contrato permite implementar e testar a estrutura sem inventar esses dados. O `build:release` permanece bloqueado até identidade/localidade, copy da home, quatro segmentos com mídia elegível, contato, privacidade e a referência da foto principal do Hero serem modelados/aprovados. Conclusão técnica e aprovação para lançamento são marcos separados.

## Prompt de entrega ao agente implementador

> Implemente o site institucional Aquarela conforme o contrato AQ-WEB-1.0.0 nos cinco arquivos de `design/`. Leia todos antes de programar e verifique `design-contract.sha256`. O contrato é a fonte normativa; DESIGN.md é pesquisa histórica e o Figma é uma referência visual parcial. Preserve as divergências intencionais especificadas. Não adicione features, altere identidade ou invente dados para preencher lacunas. Não implemente NewsCard, TeacherCard, formulário, filtros ou recursos P1 fora da baseline. Use o modelo de conteúdo e os estados de preview/publicação previstos. Inspecione a stack existente; se ainda não houver aplicação, escolha uma solução com geração estática e registre a decisão técnica. Execute a matriz de validação responsiva e os testes comportamentais definidos, corrija os problemas e entregue evidências. Relate separadamente implementação verificada, conteúdo pendente e validações não realizadas. Não publique automaticamente.
