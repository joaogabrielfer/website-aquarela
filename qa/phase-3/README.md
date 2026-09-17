# Fase 3 — auditoria inicial

Data: 17/09/2026. Estado: **iniciada, não concluída**.
Base auditada: `42bdfa0` (merge da Fase 2). Branch: `phase/3-quality-audit`.
Contrato efetivo: AQ-WEB-1.1.4, cinco hashes verificados. AGENTS.md e alguns
perfis ainda citam versões anteriores; atualizar as referências operacionais
sem alterar a baseline de design. Os adendos finais de 1.1.4 substituem
explicitamente os trechos anteriores indicados pelos próprios documentos.

## Implementação verificada

- Checkout inicialmente limpo; branch temporária local renomeada antes de edições.
- `pnpm lint`, `pnpm check` (56 arquivos, zero erros/avisos),
  `pnpm format:check`, `pnpm check-content` e `pnpm test`: passaram; 63 testes.
- `pnpm build:preview` e `pnpm build`: passaram, nove páginas cada.
- Instalação com lockfile congelado: o primeiro comando tentou compilar sharp
  contra libvips global; `SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install --frozen-lockfile`
  concluiu sem modificar dependências.
- Chromium headless: sete rotas em 390×844 e 1440×900, HTTP 200,
  um H1, pt-BR, noindex editorial e ausência de overflow horizontal.
  Capturas integrais em [initial](./initial/); dados em
  [results.json](./initial/results.json).
- Home também sem overflow em larguras 320, 360, 768, 1024 e 1920.
  Esta amostra não substitui as alturas e todas as rotas de B05.
- Abrir menu foca Fechar e torna main inerte; Escape devolve foco ao acionador.
- Rotas inexistentes e álbum inexistente respondem HTTP 404 no preview Astro.
- Não houve erro JavaScript de página no percurso automatizado inicial.
- Inspeção dos nove HTML públicos não encontrou marcadores demonstrativos nem
  nomes de campos internos de revisão; não equivale a auditoria exaustiva de
  todos os assets emitidos. Evidência: [followup.json](./initial/followup.json).

Revisão visual direta de capturas: Home e Ensino desktop; Visite mobile/desktop;
Atividades e Galeria mobile; Espaço e Aprovações desktop. As demais capturas
estão disponíveis, mas não foram individualmente revisadas nesta rodada.
Composição e marca estão coesas na amostra; conteúdo incompleto impede validar
o resultado comercial e o enquadramento das fotografias finais.

## Achados para correção e investigação

| Prioridade | Achado e evidência                                                                                                                                                                                                                                                       | Próxima ação                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Alta       | `src/pages/visite.astro:18` lê query no build estático. Acesso real a `/visite?interesse=educacao-infantil` não mostra contexto e mantém mensagem genérica do WhatsApp.                                                                                                  | Resolver contexto no navegador usando apenas slugs/nomes já projetados; rejeitar parâmetros duplicados e desconhecidos; testar build estático, não só funções unitárias. |
| Alta       | Ao redimensionar de 1099 para 1100 com Fechar focado, foco termina no BODY em Ensino, Home e Visite. Confirmado novamente aguardando explicitamente foco no modal; `followup.json`. `MobileMenu.svelte:125–137` depende de foco ainda no painel e link ativo disponível. | Preservar intenção de foco antes de ocultar o painel e definir destino visível também nas rotas sem item ativo.                                                          |
| Alta       | Fotografias dos componentes usam `img` direto; busca em src encontrou srcset apenas na logo. HeroHome e SegmentDetail usam dimensões fixas 600×450; focalPoint aparece apenas no schema.                                                                                 | Auditar projeção/caminho dos assets e implementar variantes e enquadramento do contrato. Validar com mídia sintética isolada, sem reconstruir fotos escolares.           |
| Média      | Visite mobile tem conteúdo e botões colados à borda esquerda do painel creme: ContactPanel aplica padding lateral zero abaixo de 768.                                                                                                                                    | Corrigir respiro interno mantendo gutters globais; validar 320/390 e texto ampliado.                                                                                     |
| Média      | Breadcrumb remove sublinhado no estado padrão, contrário a C12. Metadados de Ensino e detalhes de contato usam 0.9375rem (15px).                                                                                                                                         | Restabelecer sublinhado; confrontar tamanho de texto com B03 e requisito mínimo mobile.                                                                                  |
| Média      | Ainda não há configuração/suíte e2e, axe-core ou fixtures representativas versionadas. Os 63 testes são unitários.                                                                                                                                                       | Criar infraestrutura de Fase 3 e regressões para os fluxos reais, sem mascarar falhas com testes ignorados.                                                              |
| Baixa      | Wrapper OpenCode usa `--dir`/`--attach`, ausentes no `run --help` instalado em v2.0.3; referências de versão nos perfis estão defasadas.                                                                                                                                 | Adaptar execução à CLI efetiva e conferir permissões antes do próximo lote.                                                                                              |

## Recomendações anteriores

Comparação com `design/revisao-visual-2026-09-14.md`:

- Atendidas na amostra: aberturas navy/roxo/ciano; Ensino compacto com CTA lateral,
  amostra identificada, placeholders e turnos; H1 interno limitado a 22ch;
  estados vazios compactos; contato desktop em duas colunas.
- A duplicação de ação nos segmentos incompletos foi removida: o EmptyState
  atual não recebe link e permanece um CTA contextual.
- O horário renderizado não contém mais os dias da semana presumidos.
- Pendentes por conteúdo: descrição/público das atividades; equilíbrio final da
  Home com foto real; revisão da densidade do rodapé com contatos finais.
- Lenis continua proposta sem aprovação. Recomenda-se manter scroll nativo
  durante a Fase 3 e resolver primeiro acessibilidade, imagens e regressões.
  A biblioteca não é requisito para qualidade nem foi instalada.

## Conteúdo pendente

`pnpm check-release` recusou corretamente o lançamento por seis grupos:
identidade/localidade; telefone ou WhatsApp aprovado; copy principal da Home;
foto principal aprovada; quatro segmentos completos com mídia; privacidade.
Nenhum registro foi promovido a approved. Aprovações, Espaço e Galeria seguem
sem conteúdo representativo. As capturas editoriais não são aprovação de dados.

## Validações não executadas e continuação

Faltam a matriz B05 completa, álbum/lightbox com retrato/paisagem/erro,
paginação com mais de um lote, axe-core, zoom real de 200%, movimento reduzido,
teclado completo, histórico/âncoras e combinações de canais ausentes. Não houve
teste em produção, Safari/Firefox nem verificação manual interativa: o conector
de navegador estava indisponível; as interações descritas usaram Playwright.

Implementador escolhido pelo usuário: Muse Spark 1.3 Contributor via OpenCode Go.
Lead conserva revisão e integração. Nenhuma implementação foi delegada com
sucesso: OpenCode v2.0.3 retornou `provider.no-route` / `Model unavailable` para
`opencode-go/muse-spark-1.3-contributor`; `auth list --standalone` informou
`No authenticated integrations`. A consulta autenticada de uso retornou HTTP 403.
Saldo Go desconhecido; telemetria Codex não exposta nesta sessão.

O usuário foi solicitado a reconectar Go pelo `/connect`, sem enviar chave na
conversa. Nenhum modelo/provider alternativo foi acionado. A documentação
[oficial de providers](https://opencode.ai/v2/docs/providers) confirma o fluxo
de conexão e as causas possíveis de modelo indisponível; não foi diagnosticado
esgotamento de franquia.

Próximo lote proposto para Spark: testes e fixtures exclusivamente em
`tests/e2e/`, configuração Playwright e scripts de QA, com ajustes de dependências
coordenados. Correções de produção entram depois em lotes separados e com
posse explícita. Antes de rodar, conferir autenticação, saldo e permissões v2.
Spark recebe somente código público e fixtures sintéticas.
