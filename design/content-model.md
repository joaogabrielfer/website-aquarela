# Modelo de conteúdo e publicação

**AQ-WEB-1.1.4** · Autoridade para dados e estados de ausência. Contrato de formato, não implementação do armazenamento. Usar objetos tipados ou validação equivalente na stack escolhida.

## D01 — Evidência e estados

`draft` = rascunho/placeholder; `observed` = visto em fonte pública mas não aprovado para uso final; `approved` = revisado pelo responsável editorial; `archived` = retirado da publicação. Só `approved` entra no build público. Ser visível no Instagram não atribui automaticamente `approved`.

Registro de aprovação precisa de `reviewedAt` (data ISO), `reviewedBy` (identificador interno fornecido pelo responsável) e fonte; o agente não pode preencher esses campos fingindo aprovação humana. Metadados de revisão, permissões e fontes internas são usados na validação/build e não enviados em JSON público nem embutidos no HTML.

Modo padrão: `public`. `editorial-preview` deve ser ativado explicitamente no comando/configuração, exibir faixa “Prévia”, incluir noindex e aceitar placeholders identificados. `NODE_ENV=development` sozinho não autoriza publicar dados draft. Build de release recusa modo preview. Não usar um parâmetro público na URL para revelar drafts.

## D02 — Tipos base

```ts
type Status = 'draft' | 'observed' | 'approved' | 'archived';
type SegmentSlug = 'educacao-infantil' | 'fundamental-anos-iniciais'
  | 'fundamental-anos-finais' | 'ensino-medio';

type Review = {
  status: Status;
  source: string;             // URL pública ou referência interna fornecida
  reviewedAt: string | null; // YYYY-MM-DD; obrigatório se approved
  reviewedBy: string | null; // nunca inventado pelo agente
};
type Editorial<T> = { value: T; review: Review };
type Media = {
  id: string;
  src: string;               // caminho de asset controlado pelo projeto
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  focalPoint: { x: number; y: number }; // 0..1; não cortar rosto
  review: Review;
  usageApproved: boolean;    // explícito; falso não entra em público
};
```

Fotos informativas exigem alt não vazio. Decoração é SVG/CSS separada com aria-hidden, não Media com descrição fictícia. `src` não pode ser hotlink de rede social. Imagem precisa existir, ter dimensões positivas e proporção consistente com o arquivo. Asset ausente falha validação se obrigatório; não substituir silenciosamente por imagem remota.

## D03 — Escola, textos e contatos

```ts
type School = {
  name: Editorial<string>;
  tagline: Editorial<string>;
  phoneE164: Editorial<string> | null;
  whatsappE164: Editorial<string> | null;
  locality: Editorial<string>;
  address: Editorial<{
    street: string; neighborhood: string; city: string; state: string;
    number: string | null; postalCode: string | null;
  }> | null;
  mapUrl: Editorial<string> | null;
  officeHours: Editorial<string> | null;
  instagramUrl: Editorial<string>;
};
type PageCopy = {
  id: string;
  title: string;
  intro: string | null;
  metaDescription: string;
  review: Review;
};
type HomePageCopy = PageCopy & { heroImageId: string | null };
type SeasonalBanner = {
  id: string; eyebrow: string | null; title: string; body: string | null;
  tone: 'paper' | 'red' | 'navy' | 'purple';
  ctaLabel: string | null; href: string | null; active: boolean;
  review: Review;
};
type Proposal = {
  intro: string;
  facts: [string, string, string];
  imageId: string;
  review: Review;
};
type FAQ = {
  id: string; group: 'ensino' | 'atividades' | 'visita';
  question: string; answer: string; order: number; review: Review;
};
```

Campos de contato têm aprovação independente: aprovar telefone não habilita WhatsApp. URL de mapa precisa ser oficial/validada; rua parcial não autoriza criar pin. `tel:` usa E.164; exibição brasileira formatada. `wa.me` usa somente dígitos, com mensagem codificada. Sem URL arbitrária vinda de query. Aceitar https em mapa/Instagram, rejeitar javascript/data URLs.

Textos de navegação, EmptyState, controles, CTAs e ações são copy funcional congelada em routes/components. H1, apoio promocional, descrições, slogan e metadados são PageCopy/editorial, inicialmente draft. Revisão editorial pode corrigir palavras sem alterar função/estrutura; se exigir nova seção ou fluxo, revisar contrato.

Privacidade é um documento editorial separado `{body, review}` com texto simples/markup sanitizado e sem HTML executável. Deve descrever comportamento real; não copiar política de concorrente.

## D04 — Coleções

```ts
type Segment = {
  id: string; slug: SegmentSlug; name: string; order: number;
  summary: string | null; description: string | null;
  grades: string | null; ages: string | null; shifts: string[];
  experiences: string[]; imageId: string | null; review: Review;
};
type Environment = {
  id: string; name: string; purpose: string;
  images: string[]; // IDs Media, primeiro é capa
  accessInfo: string | null; order: number; review: Review;
};
type Activity = {
  id: string; slug: string; name: string; summary: string;
  description: string; audience: string;
  shifts: string[]; location: string | null;
  conditions: string | null; imageId: string | null;
  order: number; featured: boolean; review: Review;
};
type Approval = {
  id: string; displayName: string; course: string;
  institution: string; selectionProcess: string; year: number;
  portraitId: string | null;
  publicationAuthorized: boolean;
  featured: boolean; review: Review;
};
type Album = {
  id: string; slug: string; title: string;
  category: 'Projetos' | 'Eventos' | 'Cotidiano';
  date: string; // YYYY-MM-DD, data editorial confirmada do evento/álbum
  intro: string; coverId: string; photoIds: string[];
  review: Review;
};
```

Slug: único na coleção, minúsculas ASCII, dígitos e hífens; não aceitar `/`, query ou espaços. IDs únicos e estáveis; nome não é ID. Ordem de segmentos é fixa conforme routes, independentemente de entrada. Demais ordenações em routes; empate de `order` usa ID. Destaque de Atividades/Aprovações seleciona `featured=true`, aplica ordem definida e limita a 3. Sem featured, omitir bloco de destaque; não selecionar implicitamente por favoritismo.

Segmentos publicados detalhados: nome/slug, resumo, descrição, foto aprovada e pelo menos duas experiências. Séries, idades e turnos podem ficar null/vazios, sem legenda de placeholder pública. Esqueleto dos quatro títulos é parte da arquitetura; quando faltar conteúdo aprovado, mostrar o estado neutro de etapa, sem afirmar serviços.

Environment precisa de nome, finalidade e ao menos uma foto aprovada. Galeria de espaços é a concatenação de fotos desses ambientes na ordem editorial; não duplicar a mesma Media. Activity precisa de descrição e público; foto é opcional. Não inferir valores/defaults para turnos, cobrança ou local.

Approval precisa de todos os campos textuais, ano e autorização; retrato é opcional, mas sua permissão é independente. Um registro por conquista, podendo a mesma pessoa aparecer em várias; sem totais agregados em V1. Não criar páginas públicas individuais ou links para redes pessoais.

Album precisa de capa aprovada presente em `photoIds` e ao menos uma foto aprovada. Filtrar fotos não aprovadas antes de montar página, contador e lightbox. Zero fotos elegíveis retira o álbum do público e sua rota é 404. Datas históricas são preservadas; exibir em pt-BR sem deslocamento de dia por fuso horário. Não usar data de build como data de evento.

## D05 — Inventário inicial: evidência, não catálogo aprovado

Fonte histórica consultada em 08/09/2026: [Instagram público](https://www.instagram.com/aquarelacolegioecurso/). Esta etapa de contrato não refez a consulta. Valores abaixo começam como `observed`, não `approved`.

| Campo | Evidência disponível | Ação |
| --- | --- | --- |
| Nome | Aquarela Colégio e Curso | Confirmar revisão editorial |
| Slogan | Presente em todos os momentos da sua vida! | Preservar referência; aprovar copy final |
| Telefone | +5581982177132 | Aprovar para contato; o mesmo número também foi confirmado como WhatsApp, ainda `observed` e pendente de aprovação editorial |
| Localidade | Paulista/PE | Aprovar texto de localização |
| Endereço | Rua Araxá, Loteamento Conceição, Paulista/PE | Número/CEP null; mapa null |
| Etapas | Destaques de Infantil, Anos Iniciais, Anos Finais, Médio | Criar estrutura; detalhes pendentes |
| Atividades | Destaques de Ginástica, Natação, Balé | Drafts de pauta; não ofertas públicas |
| Aprovações | Existe destaque | Coleção vazia; nenhum resultado validado |
| FECAQ 2025 | Existe destaque | Nenhum álbum criado só com essa evidência |
| EVERGLOW | Existe destaque | Não classificar nem publicar como programa |
| Fotos | Nenhuma foto escolar original entregue | Bloqueio editorial de mídia final |
| Logo | `assets/logo-aquarela.PNG`, fornecida pelo usuário | Asset de marca autorizado para este projeto |

Não completar ficha com instalações, certificações ou métodos de outras escolas. Nem nome do colégio nem a palavra “Curso” confirmam preparação ENEM/SSA, bilinguismo ou curso independente.

## D06 — Estados públicos e bloqueios

| Dado ausente | Comportamento |
| --- | --- |
| Conteúdo opcional da home | Omitir seção inteira, sem espaço residual |
| Resultado, ambiente, atividade ou álbum público | Mostrar EmptyState da rota; não retirar link de navegação |
| Segmento incompleto | Preservar âncora/título e usar estado neutro + visita |
| Foto opcional de Activity/Approval | Card textual, sem avatar inventado |
| WhatsApp, horário ou mapa desconhecido | Omitir controle/campo; não inferir pelo telefone/endereço |
| Contatos todos ausentes no preview | Estado “Contato aguardando confirmação” identificado como pendência editorial |
| Álbum draft/inexistente | 404 no build público |
| Mídia obrigatória de registro approved ausente | Erro de validação; não publicar registro corrompido |

Bloqueios de **lançamento final**: foto principal da home aprovada; quatro segmentos com dados e fotos aprovados; identidade/localidade/copy principal aprovadas; ao menos um telefone ou WhatsApp aprovado; documento de privacidade aprovado; nenhuma fixture/placeholder de preview no output. Conteúdo de Aprovações, Espaço, Atividades e Galeria pode permanecer sem registros, com estados neutros, sem bloquear tecnicamente o lançamento. Informar ao usuário o efeito comercial dessas lacunas; não preenchê-las artificialmente.

O agente consegue concluir estrutura/funcionalidade antes desses insumos, mas deve reportar a publicação como pendente. Preview não representa site pronto para lançamento.

## D07 — Exemplo não publicável e validação

Exemplo de pauta, sem dados inventados de oferta:

```json
{
  "id": "atividade-natacao",
  "slug": "natacao",
  "name": "Natação",
  "summary": "",
  "description": "",
  "audience": "",
  "shifts": [],
  "location": null,
  "conditions": null,
  "imageId": null,
  "order": 1,
  "featured": false,
  "review": {
    "status": "observed",
    "source": "https://www.instagram.com/aquarelacolegioecurso/",
    "reviewedAt": null,
    "reviewedBy": null
  }
}
```

Validação deve permitir registro incompleto não publicado, mas rejeitar sua promoção a approved com campos obrigatórios vazios. Drafts podem ficar em arquivo editorial separado; nunca serializar o objeto editorial completo para o browser. Criar uma projeção pública dos campos estritamente usados na interface.

Validar no build: IDs/slugs, enums, E.164, URLs, datas, obrigatórios condicionais, referências de mídia, permissão de publicação, modo de build e bloqueios de lançamento. Mensagens indicam registro/campo. Separar `check-content` de validação de lançamento para que desenvolvimento possa testar estados vazios sem fingir que há aprovação.

### D08 — Revisão 1.1.0: Home, banner e fallbacks

`pages/home.yaml` usa `HomePageCopy`, com `heroImageId` nullable. Quando
preenchido, o ID deve existir em `media.yaml`; se a Home for `approved`, a
mídia precisa estar `approved`, `usageApproved` e existir no caminho local.
Preview resolve mídia visível; público/release resolve apenas mídia aprovada.

`SeasonalBanner` tem os campos `id`, `eyebrow`, `title`, `body`, `ctaLabel`,
`href`, `tone`, `active` e `review`. `tone` é obrigatório e aceita somente
`paper`, `red`, `navy` ou `purple`; a escolha é feita junto ao conteúdo estático,
sem aceitar cor livre. `ctaLabel` e `href` são ambos presentes ou ambos
nulos, e `href` aceita apenas rota interna segura. A Home limita a um registro
ativo. Público filtra `active` + `approved`; preview pode incluir `draft` e
`observed`. A fixture de demonstração é sintética e nunca entra no público.

Sem `PageCopy` approved, cada rota usa H1 funcional neutro (por exemplo,
“Ensino”, “Galeria” e “Aquarela Colégio e Curso” na Home) e omite
`meta description` e `og:description`; não se inventa fallback editorial.

O telefone e o WhatsApp permanecem aprovações independentes. A confirmação
direta do número nesta revisão é registrada como `observed`, sem preencher
`reviewedAt` ou `reviewedBy`.

### D09 — Revisão 1.1.2: tom do banner

O tom do `SeasonalBanner` passa a ser dado editorial projetado para a interface.
A fixture sintética de demonstração usa `red`. A validação recusa valores fora
da enumeração para impedir contraste desconhecido ou paleta arbitrária.

## D10 — Revisão 1.1.4: composição editorial demonstrativa de Ensino

O usuário autorizou lorem ipsum e reserva de imagens na prévia de Ensino para
avaliar a composição antes da entrega do conteúdo. Esta é uma exceção explícita
à interface exclusivamente pt-BR apenas para o corpo sintético em latim;
navegação, rótulos e controles permanecem em pt-BR.

Quando faltar descrição no modo editorial-preview, mostrar um parágrafo de
40–60 palavras de lorem ipsum com rótulo visível “Texto demonstrativo — conteúdo
em preparação”. Renderizar AssetPlaceholder 4:3 com “Foto oficial pendente”
quando faltar mídia elegível. Não gerar fotografia. Aplicar apenas aos quatro
SegmentDetail, sem criar resultados, ambientes, ofertas ou álbuns fictícios.

Amostra é fixture de apresentação isolada: não gravar lorem ipsum na descrição
editorial real, não preencher review, não promover registros e não contar a
amostra como experiência pedagógica. Dados observados existentes podem aparecer
na prévia, identificada pela faixa global. No público/release, excluir a fixture
e a reserva artificial de mídia e manter D06. A ausência de descrição não deve
ocultar metadados disponíveis na composição demonstrativa do preview.
