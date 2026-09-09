# Ações do responsável pelo projeto

Este documento reúne decisões, materiais e ações que dependem do usuário ou do
responsável editorial do Aquarela. Ele não significa que o site esteja aprovado
para publicação. A implementação técnica, a aprovação editorial e o deploy são
marcos separados.

## 1. Decisões necessárias antes de encerrar a Fase 1

### 1.1 Definir o comportamento do H1 e dos metadados sem `PageCopy` aprovado

O contrato exige um H1 em cada rota por acessibilidade, mas também determina que
H1, texto promocional e descrição sejam conteúdo editorial e que somente dados
`approved` entrem no build público. Hoje as páginas da Fase 2 exibem a copy de
baseline mesmo quando o `PageCopy` ainda está em `draft`.

Escolha uma das opções abaixo e responda ao agente com o texto exato da opção:

1. **Bloquear a página no build público até a copy ser aprovada — recomendado.**
   O preview editorial continua mostrando a baseline. É a interpretação mais
   conservadora da regra “só `approved` entra no público”, mas impede um site
   público navegável antes da aprovação das páginas.
2. **Usar um H1 funcional neutro no público.** Por exemplo, “Ensino” e
   “Atividades”, sem apoio promocional. Esta opção mantém as rotas acessíveis,
   mas exige um adendo ao contrato definindo os fallbacks autorizados.
3. **Autorizar a copy de baseline para publicação.** O responsável editorial
   revisa os textos de `content/pages/` e fornece os metadados de aprovação da
   seção 3 deste documento. Não basta o agente alterar o status sozinho.

Modo de entrega: responder em texto com `Decisão H1: opção 1`, `opção 2` ou
`opção 3`. Se escolher a opção 3, enviar também as aprovações de cada página.

### 1.2 Autorizar ou rejeitar a inclusão de `heroImageId` no modelo da Home

O lançamento exige uma foto principal aprovada, mas o contrato atual não possui
um campo que associe uma mídia ao Hero. Isso não pode ser resolvido por convenção
silenciosa. A recomendação técnica é adicionar `heroImageId` ao conteúdo da Home
e validar que ele referencia uma mídia `approved` com `usageApproved: true`.

Essa decisão altera o schema normativo. Se autorizada, o lead deve incrementar a
versão do contrato, atualizar os arquivos afetados e regenerar
`design-contract.sha256` antes da implementação.

Modo de entrega: responder `Autorizo adicionar heroImageId ao contrato` ou
`Não autorizo; quero outra modelagem: ...`.

### 1.3 Escolher o tipo do primeiro deploy de avaliação

- **Preview público de branch — recomendado:** usa `pnpm build`; mostra somente
  conteúdo aprovado, recebe `noindex` por ser branch não-main e reproduz o que o
  público realmente veria.
- **Preview editorial:** usa `pnpm build:preview`; mostra itens `observed` e
  placeholders com a faixa “Prévia editorial — conteúdo pendente”. Nunca deve
  ser configurado na branch `main`. Por enquanto, o caminho mais seguro é usá-lo
  localmente; um preview remoto exige configuração deliberada por branch ou um
  projeto Pages temporário separado.

Modo de entrega: responder `Primeiro deploy: preview público` ou
`Primeiro deploy: preview editorial remoto`.

## 2. Materiais obrigatórios para o lançamento

### 2.1 Identidade e contato

Confirmar por escrito:

- nome público da escola;
- slogan final, se deve aparecer;
- localidade no formato desejado;
- telefone em formato internacional, por exemplo `+55...`;
- se o mesmo número também é WhatsApp — não será inferido;
- endereço completo ou indicação explícita de quais partes podem ser públicas;
- URL oficial do mapa, se houver;
- horário de atendimento, se houver;
- URL oficial do Instagram.

Telefone, WhatsApp, mapa e horário têm aprovações independentes. Um telefone
aprovado não autoriza automaticamente um botão de WhatsApp.

Modo de entrega: texto UTF-8 em Markdown, documento compartilhado ou mensagem
estruturada. Não enviar senhas ou credenciais. Para cada campo, indicar
`aprovado`, `manter pendente` ou `não publicar`.

### 2.2 Copy das páginas

Revisar os arquivos de `content/pages/` e entregar, para cada rota:

- H1;
- introdução, quando aplicável;
- descrição para mecanismos de busca;
- confirmação de que o texto pode ser publicado.

As rotas são: Início, Ensino, Nosso espaço, Aprovações, Atividades, Galeria,
Visite e Privacidade. Navegação, CTAs, controles e EmptyStates já são copy
funcional congelada e não precisam de nova redação, salvo revisão formal do
contrato.

Modo de entrega preferido: um arquivo Markdown com uma seção por rota. Também é
aceitável comentar diretamente uma cópia dos YAML, sem mudar os campos de revisão.

### 2.3 Quatro etapas de ensino

Entregar para cada etapa — Educação Infantil, Anos Iniciais, Anos Finais e
Ensino Médio:

- resumo curto;
- descrição;
- pelo menos duas experiências pedagógicas reais e aprovadas;
- séries, idades e turnos somente quando confirmados;
- uma foto aprovada para uso público.

Não enviar afirmações genéricas como substituto de informação institucional.

### 2.4 Foto principal da Home

Entregar uma fotografia real do colégio com autorização de uso. Preferir o
arquivo original em JPEG ou PNG, sem compressão de mensageiro, marca-d'água,
filtro ou texto sobreposto. A composição final é 4:3; por isso, indicar pessoas
ou regiões que não podem ser cortadas.

Junto da imagem, fornecer:

- descrição objetiva para texto alternativo;
- legenda, se necessária;
- autoria ou fonte;
- confirmação de autorização de uso no site;
- ponto focal aproximado, como “manter o grupo central inteiro”.

Modo de entrega: arquivo original por Google Drive, Dropbox ou anexo sem
compressão. Não enviar links temporários de stories nem hotlinks de rede social.

### 2.5 Documento de privacidade

Fornecer texto aprovado que descreva apenas o funcionamento real do site. A V1
não possui formulário, trackers ou embeds de terceiros; não copiar política de
outra escola nem inventar controlador, cookies ou operações de coleta.

Modo de entrega: Markdown ou documento de texto. Indicar quem revisou e a data.
Se houver revisão jurídica, informar apenas que ela ocorreu; não incluir notas
internas ou dados privados no repositório público.

## 3. Como registrar uma aprovação editorial

Cada aprovação precisa ser fornecida por uma pessoa responsável, com:

- `status`: autorização explícita para usar `approved`;
- `source`: origem pública ou referência fornecida pelo responsável;
- `reviewedAt`: data real no formato `AAAA-MM-DD`;
- `reviewedBy`: identificador do responsável escolhido pela organização.

O identificador pode ser uma função ou nome acordado, desde que não seja
inventado pelo agente. Metadados de revisão não são publicados no HTML.

Modelo de entrega:

```text
Item: telefone institucional
Decisão: aprovado para publicação
Valor: +55...
Fonte: confirmação direta do responsável
Revisado em: AAAA-MM-DD
Revisado por: identificador acordado
Observação pública: nenhuma
```

Para fotos de estudantes ou resultados de aprovação, confirmar também a
autorização de publicação. Um resultado de aluno sem `publicationAuthorized`
permanece fora do site mesmo que os dados estejam corretos.

## 4. Materiais opcionais, mas comercialmente importantes

Estes itens não bloqueiam tecnicamente o lançamento, porém sua ausência deixa as
respectivas páginas em estado vazio:

- **Nosso espaço:** nome, finalidade e fotos aprovadas de cada ambiente;
- **Atividades:** nome, resumo, descrição, público, condições e foto opcional;
- **Aprovações:** nome autorizado, curso, instituição, processo seletivo, ano e
  autorização individual de publicação;
- **Galeria:** título, categoria, data real, introdução, capa e fotos aprovadas;
- **FAQs:** perguntas e respostas reais, até seis por grupo.

Para álbuns, entregar os arquivos originais e uma planilha ou Markdown que
relacione filename, legenda, texto alternativo, data e autorização. Não misturar
arquivos de QA sintéticos com fotografias editoriais reais.

## 5. Configuração do Cloudflare Pages

### 5.1 Antes de abrir o dashboard

- [ ] Escolher o nome do projeto e, portanto, o subdomínio inicial
      `<projeto>.pages.dev`.
- [ ] Escolher o tipo do primeiro deploy conforme a seção 1.3.
- [ ] Confirmar que a branch de produção será `main`.
- [ ] Manter o deploy automático de produção desativado enquanto
      `pnpm build:release` estiver bloqueado — recomendado.

O repositório já contém `packageManager`, lockfile, versão de Node, build estático,
`404.html`, headers e geração condicional de sitemap/canonical. Não é necessário
instalar adapter Cloudflare, Workers, Functions, KV, D1 ou R2.

### 5.2 Criação do projeto

No dashboard do Cloudflare:

> **Atenção:** concluir **Save and Deploy** cria uma URL pública `pages.dev` e
> normalmente inicia o primeiro build da branch de produção. Pare antes desse
> botão se ainda não aceitar que o estado atual fique acessível por uma URL não
> divulgada. Desativar builds automáticos depois não desfaz o primeiro deploy.

1. Abrir **Workers & Pages** → **Create application** → **Pages**.
2. Escolher **Import an existing Git repository**.
3. Autorizar e selecionar `joaogabrielfer/website-aquarela`.
4. Usar o preset **Astro**.
5. Configurar:
   - Production branch: `main`;
   - Build command: `pnpm build`;
   - Build output directory: `dist`;
   - Root directory: deixar vazio, pois o projeto está na raiz.
6. Em variáveis de build de produção, definir `NODE_VERSION=22.16.0`.
7. Após o Pages informar o subdomínio definitivo, definir em produção
   `SITE_URL=https://<projeto>.pages.dev` e executar novo deploy.
8. Não adicionar `APP_BUILD_MODE=editorial-preview` à produção.
9. Não ativar Functions, Workers ou bindings.

O Pages injeta `CF_PAGES_BRANCH` e `CF_PAGES_URL`. Em branches não-main, o site
usa a URL real do preview nos canonicals e inclui `noindex`.

### 5.3 Controle de branches recomendado

- Production deployments: `main`, inicialmente com automação desativada.
- Preview deployments: todas as branches não-main ou somente `feat/*` e
  `fix/*`, conforme preferência de consumo de builds.
- Não testar implementação nova diretamente na `main`.

Criar/trocar branch e fazer push são ações que exigem pedido explícito ao agente
ou execução manual do usuário. Este documento não concede essa autorização.

### 5.4 Verificação após o primeiro preview remoto

Entregar ao agente a URL completa do deploy e, se o build falhar, copiar o trecho
do log desde o primeiro erro — nunca enviar cookies, tokens ou headers de
autenticação. A revisão deve confirmar:

- acesso direto e refresh das rotas;
- status 404 real para uma rota inexistente;
- presença dos headers de segurança e cache;
- canonical apontando para a URL do próprio preview;
- `noindex` em branch não-main;
- ausência de drafts e metadados de revisão no build público;
- ausência de Functions/Workers no projeto;
- layout em desktop e mobile.

## 6. Preparação para iniciar a Fase 2

Antes de abrir o primeiro lote novo:

- [ ] Resolver ou registrar formalmente as decisões 1.1 e 1.2.
- [ ] Escolher o provider do Luna para o lote específico quando o lead perguntar.
- [ ] Confirmar se a franquia OpenCode Go já saiu do rate limit; se não, Spark
      permanece pausado e o lead pode propor Luna no Codex.
- [ ] Usar branch de feature/preview, mediante autorização explícita.
- [ ] Executar `pnpm lint`, `pnpm check`, `pnpm check-content`, `pnpm test`,
      `pnpm format:check` e `pnpm build` antes e depois de cada fatia coerente.
- [ ] Manter `pnpm build:release` como bloqueado até os insumos editoriais reais
      estarem aprovados.

O próximo trabalho não deve recriar componentes já existentes sem auditoria. A
Fase 2 começa pela comparação do estado atual com os lotes A–D, corrigindo cada
lote com posse exclusiva e checks proporcionais.

## 7. Resposta curta sugerida ao agente

Copie, preencha e envie quando estiver pronto:

```text
Decisão H1: opção ...
Hero no modelo: autorizo / não autorizo; observação: ...
Primeiro deploy: preview público / preview editorial remoto
Nome desejado no Pages: ...
Automação de produção: manter desativada / ativar quando release passar
Provider do próximo lote Luna: responder somente quando o lote for apresentado
Materiais já disponíveis: ...
Materiais ainda pendentes: ...
```
