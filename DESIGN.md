# Aquarela — direção de design e especificação do site

Versão 1.1 · 8 de setembro de 2026 · Documento de projeto, ainda sem implementação.

Este documento orienta um site institucional de marketing: apresentar o colégio, explicar sua proposta, mostrar experiências e facilitar uma visita. Não inclui gestão de alunos, área restrita, marketplace, pagamentos ou matrícula transacional.

## 1. Como usar esta especificação

O [Figma inicial](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA) é uma exploração visual parcial. Este documento complementa as lacunas e propõe correções; não descreve todas elas como já desenhadas. Para implementar, seguir as decisões e medidas aqui indicadas e usar os links de frames da seção 10 como referências visuais. A [logo original](./assets/logo-aquarela.PNG) acompanha este documento, sem alterações.

Ordem de referência: informações oficiais confirmadas do colégio → requisitos do usuário → decisões deste documento → Figma inicial. Divergências visuais deliberadas estão registradas na seção 10. Os textos promocionais sugeridos precisam de revisão editorial do colégio.

O inventário do Figma vem das operações verificadas na etapa anterior, registradas em [prototipo-figma.md](./prototipo-figma.md). Não houve nova inspeção do canvas neste estudo. IDs são referências existentes, não promessa de que permanecerão iguais após edições externas.

## 2. Diagnóstico: o que mudar na proposta inicial

**Manter o caráter colorido, mas dar protagonismo à escola real.** O banner geométrico tem personalidade e boa hierarquia. Entretanto, poderia pertencer a uma agência criativa, curso de design ou brinquedoteca. Precisa de uma fotografia real, localização e uma frase que esclareça as etapas atendidas.

**Acrescentar “Ensino”.** Espaço, atividades, resultados e galeria ajudam a decisão, mas não explicam o que a família está contratando. A ausência dos segmentos é a maior lacuna da primeira estrutura. Recomendo uma página de Ensino e quatro atalhos logo após o banner.

**Evitar uma estética exclusivamente infantil.** O Instagram apresenta também Ensino Médio. Arcos e cores podem acompanhar todas as idades; excesso de círculos, estrelas, letras gigantes e mascotes tornaria a marca inadequada aos adolescentes. Fotografias, títulos sóbrios e espaços em branco devem equilibrar o lado lúdico.

**Não distribuir as seis cores com a mesma intensidade.** O nome Aquarela não exige um fundo diferente em cada bloco. Usar uma base neutra consistente, azul para identidade e um ou dois acentos por composição. Reservar o conjunto completo para detalhes da marca.

**Rever o papel das aprovações.** É uma página importante para o público do Ensino Médio, mas não deve dominar a abertura para famílias de crianças pequenas. Apresentar conquistas com ano e contexto, sem rankings ou percentuais sem base verificável.

**Separar espaço de galeria.** “Nosso espaço” responde onde e como se aprende: ambientes permanentes, localização e visita. “Galeria” mostra o que acontece: eventos, projetos e cotidiano. Repetir as mesmas fotos nas duas páginas enfraquece essa distinção.

**Banner não precisa ser carrossel.** Recomendo uma mensagem principal estática com duas ações claras. Campanhas sazonais podem usar uma faixa pequena, com data de encerramento. Não esconder informações fundamentais em slides que passam sozinhos.

**Modernidade deve aparecer na clareza.** Responsividade, boas fotos, conteúdo direto e carregamento rápido têm mais valor aqui que parallax, efeitos 3D ou animações de rolagem. O protótipo inicial é uma direção, não um modelo a copiar integralmente.

## 3. Informações encontradas sobre o Aquarela

Fonte: [perfil público @aquarelacolegioecurso](https://www.instagram.com/aquarelacolegioecurso/), consultado no navegador em 08/09/2026. A leitura automática da página falhou; o navegador exibiu a bio, os títulos dos destaques e as miniaturas. Ao abrir uma publicação, o Instagram exigiu login. Não foram verificadas legendas completas, datas ou o conteúdo dos stories.

| Informação observada | Uso possível | Limite da evidência |
| --- | --- | --- |
| Nome Aquarela Colégio e Curso | Identificação e assinatura | Não esclarece quais cursos independentes existem |
| “Presente em todos os momentos da sua vida!” | Referência para tom de continuidade | Não substituir automaticamente por um novo slogan |
| Telefone (81) 98217-7132 | Contato público, link de ligação | A bio não confirmou que o número atende por WhatsApp |
| Rua Araxá, Loteamento Conceição — Paulista/PE | Contexto local no banner e contato | Número, CEP, ponto do mapa e acesso precisam ser confirmados |
| Destaques de Educação Infantil, Anos Iniciais, Anos Finais e Ensino Médio | Base para organizar os quatro segmentos | Não confirma séries, faixas etárias, vagas ou turnos atuais |
| Destaques de Ginástica, Natação e Balé | Candidatos prioritários para a página de atividades | Confirmar oferta atual, público, horários e condições |
| Destaques de Aprovações e FECAQ 2025 | Indicam acervo potencial de resultados e eventos | Não deduzir números, significado da sigla ou edição atual |
| Destaque EVERGLOW | Pauta para esclarecer com a escola | Não inferir que seja programa bilíngue, parceiro ou modalidade |

Não usar número de seguidores como prova de qualidade educacional. Não transferir serviços das escolas pesquisadas para o Aquarela. Fotos públicas não são automaticamente arquivos adequados ou autorizados para republicação no site: solicitar os originais selecionados pelo colégio.

## 4. Estudo de referências

Pesquisa qualitativa de páginas públicas, arquitetura de informação e capturas no navegador. Não houve acesso a métricas de conversão, testes de usuários ou auditoria completa de desempenho. “Adotar” e “evitar” abaixo são recomendações de design para este projeto, não resultados medidos das escolas.

| Referência | Observação | Adaptação recomendada | O que não transportar |
| --- | --- | --- | --- |
| [CESAR School](https://www.cesar.school/) | Destaques de campanha, hierarquia de títulos, caminhos por oferta e acesso a visita/contato | Aproveitar o impacto editorial e atalhos por interesse; usar segmentos escolares em vez de catálogo universitário | Navegação extensa, linguagem de ensino superior e dependência de carrosséis. Sua escola é de outro segmento: é referência visual, não equivalente direto |
| [Santa Emília — Olinda](https://colegiosantaemilia.com.br/olinda/) | Fotografia de estudante e ambientes na abertura; blocos por etapa; atividades complementares; estrutura e contato | Mostrar pessoas reais, conectar proposta à faixa escolar e explicar a função de cada ambiente | Colagem muito carregada no banner, texto sobre muitas imagens e galerias longas sem curadoria. Não copiar programas, resultados ou valores institucionais |
| [Escola Concept — Ensino](https://www.escolaconcept.com.br/portuguese/ensino) e [inicial](https://www.escolaconcept.com.br/portuguese) | Segmentos explícitos, explicação da experiência de aprendizagem, visita, fotografias e depoimentos. A inicial exibiu convite em modal para tour | Organizar conteúdo pela pergunta da família: “como é esta etapa?”; manter visita acessível e depoimentos contextualizados | Pop-up de entrada, tour 360° no MVP e quantidade de interações da página. A organização de séries da Concept não deve ser aplicada ao Aquarela |
| [Beit Yaacov](https://beityaacov.com.br/) | Abertura com imagem/vídeo do campus, história, linha do tempo, etapas e explicação de valores | Traduzir identidade institucional em fatos e histórias; aproveitar uma história breve com foto real | Longa cronologia na home, vídeo obrigatório e terminologia própria. Tradições e certificações são específicas da instituição |

Síntese aplicada: fotografia para criar reconhecimento; segmentos para orientar a escolha; conteúdo institucional concreto para gerar confiança; contato simples para avançar. Para o Aquarela, essas quatro funções são mais importantes que multiplicar páginas ou efeitos.

## 5. Arquitetura de informação

Recomendação: preservar as cinco páginas solicitadas e acrescentar duas páginas pequenas, Ensino e Visite. As páginas de cada segmento podem começar como seções com âncoras, evitando quatro páginas rasas adicionais.

| Rota | Título | Pergunta respondida | Ação principal |
| --- | --- | --- | --- |
| `/` | Início | Esta escola combina com nossa família? | Conhecer a escola |
| `/ensino` | Ensino | Como funciona a etapa que procuro? | Conversar sobre a etapa |
| `/nosso-espaco` | Conheça nosso espaço | Onde meu filho vai aprender e conviver? | Solicitar uma visita |
| `/aprovacoes` | Aprovações | Quais conquistas podem ser verificadas? | Conhecer o Ensino Médio |
| `/atividades` | Atividades extracurriculares | O que pode complementar a formação? | Consultar atividades |
| `/galeria` | Galeria | Como é a vida na escola? | Explorar um álbum |
| `/visite` | Venha conhecer o Aquarela | Onde fica e como falar com a equipe? | Ligar / abrir WhatsApp confirmado |

Rotas de apoio: `/galeria/[album]` apenas para álbuns publicados; `/privacidade` com conteúdo específico do funcionamento real do site. “Curso” não ganha rota própria até que a oferta seja esclarecida.

### Navegação compartilhada

Logo à esquerda, ligada à inicial. Links: Ensino, Nosso espaço, Aprovações, Atividades, Galeria. Botão de destaque: “Quero conhecer”, levando a `/visite`. O logo substitui o link textual “Início” no desktop; incluir “Início” explicitamente no menu mobile.

Não criar megamenu nesta versão. Abaixo de 1100 px, usar menu compacto se a navegação não couber com conforto. Itens ativos precisam de sublinhado ou outro sinal além da cor. O menu deve funcionar por toque e teclado, sem depender de hover.

Rodapé: logo original sobre área branca, breve assinatura institucional, navegação, telefone, endereço confirmado, Instagram e privacidade. Se o restante do rodapé for azul, manter a marca em uma área branca; não inverter ou reconstruir a logo sem versão oficial.

## 6. Seções de cada página, na ordem

### 6.1 Início

1. **Cabeçalho.** Navegação compartilhada e ação de visita.
2. **Banner principal.** Duas colunas: texto em fundo creme e foto real em enquadramento amplo. Rótulo “Aquarela Colégio e Curso · Paulista/PE”. Proposta de título: “Presente em cada fase. Pronto para novas descobertas.” Proposta de apoio: “Conheça as etapas de ensino, os espaços e as experiências do Aquarela.” CTA principal “Quero conhecer”; secundário “Explore nosso ensino”. Validar a nova redação com a escola; o slogan da bio continua como alternativa institucional.
3. **Ensino em cada fase.** Quatro cards: Infantil, Fundamental — Anos Iniciais, Fundamental — Anos Finais, Ensino Médio. Cada card tem foto, nome da etapa, uma frase específica aprovada e link para a âncora correspondente de `/ensino`. Não publicar faixas etárias presumidas.
4. **O jeito Aquarela de aprender.** Foto de uma situação real + três aspectos concretos confirmados da proposta pedagógica. Evitar “excelência, inovação, acolhimento” sem exemplos. Este bloco absorve uma breve apresentação institucional; não exige página Sobre no MVP.
5. **Conheça os espaços.** Uma imagem principal, duas secundárias, legendas sobre usos e link para a página. Sem repetir todos os ambientes.
6. **Além da sala de aula.** Até três atividades atuais confirmadas, com link para a lista completa. Ginástica, Natação e Balé são candidatas baseadas nos destaques, não ofertas já validadas.
7. **Histórias e conquistas.** Até três registros oficiais. Dar link para Aprovações. Sem material suficiente, omitir esta seção na publicação e não substituí-la por números fictícios.
8. **A vida no Aquarela.** Três álbuns recentes selecionados, com tema e data. Evitar feed automático do Instagram.
9. **Venha nos conhecer.** Convite curto, localização resumida e CTA. FAQ de quatro perguntas úteis pode ficar nesta seção ou em `/visite`, sem duplicar respostas extensas.
10. **Rodapé.**

A home é uma seleção, não a soma de todo o conteúdo das páginas internas. Cada seção deve justificar sua presença com uma informação ou ação distinta. Se a página ficar longa, reduzir os destaques antes de acrescentar carrosséis.

### 6.2 Ensino

1. Abertura curta: “Cada fase tem suas descobertas”.
2. Navegação de âncoras para os quatro segmentos, com links normais e sem conteúdo fundamental oculto em abas.
3. Um bloco por etapa, com foto específica, séries/idades confirmadas, abordagem pedagógica em dois parágrafos curtos, rotina/turnos confirmados e dois exemplos de experiências reais.
4. Ação contextual por bloco: “Conversar sobre o Ensino Médio”, por exemplo, levando a `/visite?interesse=ensino-medio`.
5. Perguntas frequentes: adaptação, transição de etapa e visita; respostas a fornecer pela escola.
6. Convite de visita e rodapé.

Variação editorial: Infantil enfatiza adaptação e descobertas; Anos Iniciais, consolidação de aprendizagens; Anos Finais, autonomia; Médio, trajetória e próximos passos. São temas de pauta, não alegações sobre serviços existentes.

### 6.3 Conheça nosso espaço

1. Abertura compacta com uma fotografia do ambiente e título. Reduzir a altura do bloco ciano do Figma para que a primeira foto apareça cedo.
2. Apresentação de 40–70 palavras sobre o espaço, revisada pelo colégio.
3. Grade editorial de ambientes: uma foto ampla em destaque e pares de imagens abaixo. Cada item informa nome e uso; não basta “Sala 1”. Usar de seis a dez fotos de qualidade, conforme o acervo.
4. Vídeo curto opcional, iniciado por clique, com capa e controles. Foto estática é suficiente para o MVP.
5. Informações de visita: endereço, acesso e acessibilidade física efetivamente confirmados. Link “Como chegar” com destino validado, sem pin aproximado inventado.
6. CTA de visita e rodapé.

Não deduzir uma piscina própria só porque há destaque de Natação. Não inserir laboratório, biblioteca, quadra ou estrutura de concorrentes sem confirmação.

### 6.4 Aprovações

1. Abertura curta com amarelo como acento e título “Conquistas que abrem novos caminhos”.
2. Ano ou período claramente informado, sem atualização automática para o ano atual.
3. Mural: estudante com publicação autorizada, curso, instituição, processo seletivo e ano. Fotografia opcional; não usar avatares gerados para representar aprovados reais.
4. Filtro por ano somente quando houver mais de um ano; filtro por processo apenas quando ajudar no volume real de registros.
5. Uma história de trajetória, se houver depoimento autorizado. Nada de frases atribuídas ficticiamente a famílias ou estudantes.
6. Link para Ensino Médio e convite para conversar.

Sem dados: o protótipo pode ter exemplos claramente marcados. Na versão pública, usar um estado honesto “Resultados em atualização” e contato, ou retirar o link do menu até haver conteúdo; não publicar cards de demonstração. Totais devem indicar a regra de contagem, pois uma pessoa pode ter várias aprovações.

### 6.5 Atividades extracurriculares

1. Abertura com foto de atividade real e título “Novos interesses, novas descobertas”.
2. Lista de modalidades confirmadas. Cards com nome, benefício descrito sem exagero, público, local/turno e indicação de contratação separada quando aplicável e confirmada.
3. Detalhe simples no próprio card ou em expansão acessível. Não abrir uma página por modalidade se houver apenas uma frase de conteúdo.
4. Dúvidas: quem pode participar, como consultar horários e como conhecer a atividade. Não afirmar inclusão na mensalidade.
5. CTA “Consultar atividades” e rodapé.

Com até seis modalidades, uma grade simples é suficiente. Categorias/filtros só se o volume justificar. EVERGLOW permanece fora da página até a escola explicar o que é.

### 6.6 Galeria

1. Abertura breve e primeiro álbum visível rapidamente.
2. Grade de álbuns: capa, título, data e categoria. Categorias iniciais possíveis: Projetos, Eventos, Cotidiano — publicar apenas as que tiverem conteúdo.
3. Página de álbum com introdução curta e grade consistente. Lightbox com anterior/próxima, legenda, fechamento por Esc e retorno de foco ao item original.
4. “Carregar mais” quando necessário; sem rolagem infinita.
5. Link discreto para o Instagram e rodapé.

FECAQ 2025 pode orientar a busca de um álbum histórico, sem apresentá-lo como evento futuro. Evitar transformar a galeria em uma coleção de cartazes com texto ilegível. Selecionar registros fotográficos originais.

### 6.7 Visite

1. Título “Venha conhecer o Aquarela” e explicação do próximo passo: conversar com a equipe para combinar uma visita.
2. Telefone público observado, endereço parcial identificado e horário de atendimento a confirmar.
3. Botão de ligação; WhatsApp somente após confirmar o canal. O link abre uma conversa com mensagem sugerida; não envia automaticamente.
4. Link de mapa após validar endereço completo e destino. Evitar embed pesado como requisito de carregamento.
5. FAQ: agendamento, documentos necessários para conversa inicial, etapas atendidas e acesso à escola. Respostas oficiais pendentes.

O MVP não precisa de formulário. Se adotado depois, deve ter destino real, estados de envio/erro e coleta mínima; não pedir dados sensíveis de crianças para um primeiro contato. Não mostrar “Visita confirmada” quando foi enviada apenas uma solicitação.

## 7. Sistema visual

### 7.1 Paleta com funções

Os hexadecimais originais foram propostos visualmente a partir da logo; não são apresentados como manual oficial da marca. Preservar o arquivo da logo. Tons novos servem à interface, não à recoloração da marca.

| Token sugerido | Cor | Função |
| --- | --- | --- |
| `brand.navy` | `#004C73` | Títulos, links e elementos institucionais |
| `brand.red` | `#F51623` | Acentos, faixas e pequenos elementos gráficos |
| `brand.orange` | `#FA5721` | Detalhes gráficos; evitar texto pequeno sobre branco |
| `brand.yellow` | `#FFBF0C` | Destaques de conquistas e pequenas superfícies |
| `brand.cyan` | `#00B5E2` | Destaques de espaços e identidade gráfica |
| `brand.purple` | `#96248F` | Acentos de atividades e superfícies pontuais |
| `surface.paper` | `#FFF9EF` | Superfície acolhedora do banner e alternância de seções |
| `surface.base` | `#FFFFFF` | Base de leitura e fotografias |
| `text.muted` | `#516574` | Texto secundário em fundos claros |
| `text.ink` — novo | `#123747` | Texto corrido e texto sobre ciano |
| `action.primary` — novo | `#D91424` | Botão principal com texto branco |

Orientação de composição, não contagem rígida de pixels: aproximadamente 70% de áreas neutras, 20% de fotografia/azul e 10% de acentos. No máximo duas cores saturadas dominantes por seção. Manter o mesmo tratamento dos botões entre páginas; a cor do CTA não muda com o tema da seção.

**Contrastes calculados em sRGB, para pares sólidos, sem transparência:**

| Par | Razão aproximada | Decisão |
| --- | --- | --- |
| Branco / vermelho original | 4,18:1 | Não usar em texto pequeno de botão |
| Branco / vermelho de ação | 5,15:1 | Usar no CTA principal |
| Azul original / ciano | 3,82:1 | Corrigir textos pequenos da abertura de Espaço |
| Ink / ciano | 5,24:1 | Usar quando houver texto nesse fundo |
| Branco / roxo | 7,13:1 | Combinação disponível para superfície roxa |
| Azul / amarelo | 5,57:1 | Combinação para conquistas |
| Azul / creme | 8,79:1 | Combinação principal para títulos |
| Texto secundário / branco | 6,06:1 | Combinação para leitura secundária |

Meta de projeto: pelo menos 4,5:1 em texto normal; testar também estados interativos e texto sobre fotografias. Esta tabela não certifica a acessibilidade do site completo. Preferir texto fora das fotos a depender de filtros escuros para fazê-lo aparecer.

### 7.2 Tipografia e dimensões

Manter **Outfit**, já usada no Figma, em pesos 400, 500 e 700. Uma única família é suficiente. Texto corrido em peso regular, sem centralizar parágrafos longos. Máximo aproximado de 65 caracteres por linha nas áreas de leitura.

| Uso | Desktop | Mobile | Entrelinha |
| --- | --- | --- | --- |
| Título principal da home | 64–72 px | 38–44 px | 1,05–1,1 |
| Título de página interna | 48–56 px | 34–40 px | 1,1 |
| Título de seção | 36–42 px | 28–32 px | 1,15 |
| Título de card | 22–26 px | 22–24 px | 1,2 |
| Texto corrido | 18 px | 16–18 px | 1,5–1,65 |
| Navegação / botão | 16 px | 16 px | 1,3 |
| Legenda | 14 px | 14 px | 1,4 |

O Figma usa entrelinha curta em vários parágrafos e títulos internos de 68 px. Aumentar a entrelinha de leitura e reduzir os títulos internos. Não replicar todas as quebras de linha manuais em telas menores.

Container: máximo 1296 px, centralizado. Em 1440 px, margens de 72 px, preservando a composição inicial. Margens de 32 px em tablets e 20 px em celulares. Espaçamento de seção: 80–96 px no desktop, 48–64 px no mobile. Grade de 12 colunas no desktop, 8 no tablet e 4 no mobile; gaps de 24/20/16 px.

Raios: 20–24 px em mídia e cards; botões com raio completo. Não arredondar todos os blocos da página: alternar seções abertas com cartões para evitar aparência de dashboard. Sombras discretas só quando houver necessidade de separar uma superfície, não em todas as imagens.

### 7.3 Fotos, marca e movimento

Banner: foto real 4:3 ou 5:4, sem texto embutido, rostos inteiros e espaço para enquadramento responsivo. Preferir situação de aprendizagem ou convivência a uma fachada vazia. Fachada funciona melhor em Espaço e Visite. Não usar foto de banco como se fosse instalação ou aluno do colégio.

Usar arcos derivados da linguagem da logo como apoio: um recorte gráfico ou faixa no contorno da foto, nunca sobre rostos. A arte geométrica inicial pode ser preservada em uma seção editorial ou como alternativa temporária de protótipo. Não deve ser a única evidência visual da escola no lançamento.

Preparar uma versão de uso da logo com limites de imagem ajustados e proporção preservada, mantendo o original arquivado. O arquivo fornecido tem margem branca muito grande; não repetir em produção a técnica do Figma de deslocar uma imagem enorme para dentro de um frame pequeno. Solicitar SVG oficial se existir; não redesenhar letras ou símbolo.

Animações: feedback de botões e transições curtas de 150–250 ms. Respeitar preferência por movimento reduzido. Sem contadores animados, autoplay obrigatório ou conteúdo inicialmente invisível dependente de animação.

## 8. Features simples, por prioridade

Estas são propostas para marketing institucional; não dependem de contas de famílias ou sistemas escolares.

| Prioridade | Feature | Por que incluir | Regra de simplicidade |
| --- | --- | --- | --- |
| P0 | Atalhos de etapas | Levar rapidamente à informação relevante | Quatro links, sem quiz de recomendação |
| P0 | Contato contextual | Ajudar a equipe a entender o interesse | Parâmetro opcional de etapa; sem envio automático |
| P0 | Ligação e mapa | Reduzir esforço de contato e visita | Telefone observado; mapa com destino validado |
| P0 | Menu mobile acessível | Tornar todas as páginas alcançáveis | Uma camada, fechar com Esc e ao navegar |
| P0 | Galeria com ampliação | Permitir ver detalhes reais | Legendas, teclado e imagens sob demanda |
| P0 | FAQ curto | Responder dúvidas antes do contato | Quatro a seis respostas oficiais |
| P0 | Metadados por página | Fazer compartilhamentos parecerem institucionais | Título, descrição e imagem próprios |
| P1 | Filtro de aprovações por ano | Encontrar resultados relevantes | Somente com acervo suficiente |
| P1 | Categorias de álbuns | Organizar um acervo crescente | Ocultar categorias vazias |
| P1 | Faixa de campanha | Divulgar visita aberta ou período de matrícula | Conteúdo com validade; sem urgência inventada |
| P1 | Vídeo de apresentação por clique | Mostrar a escola em movimento | Capa leve e player carregado só quando solicitado |
| P1 | Depoimentos selecionados | Dar contexto às experiências | Poucos relatos reais e aprovados |

Deixar fora desta versão: chatbot, tour 360°, busca global em um site pequeno, feed automático de rede social, notificações push e pop-up de matrícula ao entrar. São custos de manutenção ou interrupções que ainda não têm benefício demonstrado para este projeto.

## 9. Comportamento mobile e critérios de implementação

### Composição

Em celular, banner em coluna: rótulo, título, apoio, ações e foto. Não usar altura fixa de 100vh. A foto deve aparecer cedo, sem reduzir o texto a tamanhos ilegíveis. Botões podem ocupar a largura disponível, com altura mínima de projeto de 44 px. Grades: quatro segmentos em 4/2/1 colunas; álbuns em 3/2/1. Sem carrossel horizontal para esconder conteúdo básico.

Cabeçalho compacto: logo, botão de menu e acesso à visita dentro do menu. Uma barra inferior fixa de contato só deve entrar após verificar que não cobre conteúdo ou controles; não é requisito do MVP. Testar em 360, 390, 768, 1024 e 1440 px, além de zoom de texto.

### Conteúdo e funcionamento

- Um título principal por página, links descritivos, navegação por teclado e foco visível. A cor sozinha não indica seleção.
- Lightbox com foco controlado, Esc, controles nomeados e restauração de foco. Imagens decorativas não precisam ser anunciadas.
- Fotos com dimensões reservadas, variações de tamanho e carregamento sob demanda abaixo da dobra. A imagem principal não deve ser adiada como as da galeria.
- Links públicos funcionam sem login. Não depender de Instagram incorporado para apresentar conteúdo essencial.
- Metas de qualidade: leitura confortável, ausência de sobreposição e mudança brusca de layout, imagem principal otimizada e nenhum vídeo carregado obrigatoriamente. Verificar em aparelho móvel real antes de afirmar bom desempenho.
- Manter conteúdo em arquivos estruturados ou CMS leve já disponível no projeto; não introduzir backend só para um mural pequeno. A stack ainda não foi escolhida nesta especificação.

### Campos mínimos para conteúdo

| Coleção | Campos |
| --- | --- |
| Escola | nome, telefone, canal de WhatsApp confirmado, endereço completo, URL do mapa, horário, Instagram |
| Segmento | slug, nome, séries/idades confirmadas, texto, experiências, foto, texto alternativo, contato |
| Ambiente | nome, finalidade, fotos, legendas, informação de acesso confirmada |
| Atividade | nome, público, descrição, turnos, local, condições, data de revisão |
| Aprovação | nome autorizado, curso, instituição, processo, ano, fonte interna, foto opcional |
| Álbum | slug, título, categoria, data, descrição, capa, fotos e legendas |

Controle interno de origem/aprovação de fotos e textos não deve aparecer como texto de interface. Demonstrações precisam ficar isoladas do conteúdo público. Campos desconhecidos devem ser omitidos ou impedir a publicação do registro; não preencher com dados plausíveis inventados.

## 10. Referência cruzada com o Figma inicial

Arquivo: `vj8pbFXTeMZiDMFQPRpwqA`. Página: `0:1`, “01 • Website / Desktop”. Links abaixo abrem nós existentes no arquivo inicial.

| Elemento / destino | Referência Figma | Estado registrado | Manter / alterar na implementação |
| --- | --- | --- | --- |
| Home `/` | [Frame 2:2](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-2) | Cabeçalho, banner e introdução de conteúdo | Manter grid e personalidade; acrescentar segmentos, fotos, seções e rodapé |
| Cabeçalho global | [3:8](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-8) | Logo, links e botão azul | Acrescentar Ensino; logo como retorno à home; CTA vermelho de ação e destino Visite; criar mobile |
| Logo original | [3:10](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-10) | PNG original enquadrado dentro de frame | Preservar desenho e proporção; otimizar limites do asset para uso web |
| Navegação | [3:11](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-11) | Destinos internos ligados no protótipo | Não copiar IDs como rotas; usar rotas semânticas; adicionar estado ativo além da cor |
| Banner da home | [3:157](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-157) | Texto, CTA e arte lateral | Manter duas colunas e creme; trocar protagonismo da arte por foto; incluir localização; revisar copy |
| Arte geométrica | [3:170](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=3-170) | Vetores editáveis | Usar como referência de formas secundárias; não reproduzir o bloco inteiro em toda página |
| Conteúdo inicial | [4:92](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-92) | Título/introdução e cards vazios | Substituir “universo para explorar” pelo acesso prioritário aos segmentos; seção 6.1 |
| Espaço `/nosso-espaco` | [Frame 2:3](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-3) | Cabeçalho, abertura e introdução de ambientes | Reduzir abertura; corrigir contraste; adicionar fotografias com legendas e visita |
| Abertura de Espaço | [4:76](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-76) | Fundo ciano | Texto pequeno em ink; título menor; foto mais cedo |
| Grade de ambientes | [4:100](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-100) | Contêiner vazio | Criar composição da seção 6.3; não tratar vazio como especificação pronta |
| Aprovações `/aprovacoes` | [Frame 2:4](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-4) | Cabeçalho, abertura e introdução | Manter amarelo como acento; incluir ano, dados oficiais e contexto |
| Abertura de Aprovações | [4:80](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-80) | Fundo amarelo e título grande | Reduzir altura; manter azul sobre amarelo |
| Mural | [4:105](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-105) | Contêiner vazio | Implementar estados com/sem dados e filtro condicional |
| Atividades `/atividades` | [Frame 2:5](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-5), [abertura 4:84](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-84) | Somente cabeçalho e abertura | Adicionar foto e conteúdo da seção 6.5; manter linguagem adequada a várias idades |
| Galeria `/galeria` | [Frame 2:6](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=2-6), [abertura 4:88](https://www.figma.com/design/vj8pbFXTeMZiDMFQPRpwqA?node-id=4-88) | Somente cabeçalho e abertura | Encurtar abertura, acrescentar álbuns e lightbox |
| Ensino, Visite, rodapé, mobile e estados de interação | Sem frame existente | Não desenhados | Criar conforme este documento; não atribuir ao Figma uma validação inexistente |

As telas têm largura de 1440 px e layout vertical. O comportamento de navegação foi configurado, mas não houve teste manual integral em apresentação. O botão de visita em Nosso espaço estava sem destino; o destino definitivo deve ser `/visite`.

## 11. Sequência recomendada para o agente implementador

1. Ler este documento e o inventário anterior; inspecionar o checkout e as instruções locais antes de escolher ferramentas. Não existe obrigação de usar uma stack específica derivada deste Figma.
2. Preparar logo e tokens; criar cabeçalho, rodapé, botão, card de segmento e estilos de texto consistentes.
3. Implementar a home primeiro em mobile e desktop, incluindo os segmentos. Usar slots de mídia claramente identificados durante desenvolvimento se faltarem fotos.
4. Implementar Ensino e Visite: são os caminhos centrais da decisão e contato.
5. Implementar Espaço, Atividades, Aprovações e Galeria usando os conteúdos confirmados. Prever estados honestos de ausência de conteúdo.
6. Revisar copy e dados com a escola; substituir todo conteúdo de demonstração antes de publicar.
7. Testar rotas, contatos, menu, teclado, lightbox, responsividade, contraste e carregamento. Comparar com os frames citados considerando as divergências intencionais, não por igualdade de pixels.

### Insumos que faltam, sem impedir a construção da estrutura

- Endereço completo, link de mapa e confirmação do canal de WhatsApp.
- Séries, idades, turnos e proposta de cada segmento; esclarecer a oferta de “Curso”.
- Descrição e condições atuais de Ginástica, Natação e Balé; significado de EVERGLOW.
- Fotos originais selecionadas: banner, segmentos, ambientes, atividades e álbuns.
- Resultados oficiais com ano e contexto; depoimentos autorizados, caso sejam usados.
- Slogan e textos finais; horário de atendimento e funcionamento da visita.

## 12. Limite do Figma e continuidade

Consulta de conta nesta etapa confirmou Starter / View. A [documentação atual de limites MCP](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) informa até **20 chamadas por mês** para Starter. Materiais antigos indexados mencionam seis; a página atual consultada tem o valor 20. O servidor bloqueou operações na etapa anterior por limite do plano.

A consulta de conta não fornece saldo nem data/hora de renovação. A documentação consultada não esclarece o instante de reset desta conta. Portanto, não é possível afirmar “amanhã”, “dia 1º” ou “daqui a 30 dias”. O retorno de uma ferramenta isenta como `whoami` não comprova renovação da cota de edição/leitura.

O limite identificado é da integração MCP; não é evidência de que a visualização do arquivo esteja bloqueada. Não alterar o plano ou comprar assento como parte deste trabalho. O documento permite seguir com a implementação sem esperar novas operações no Figma.
