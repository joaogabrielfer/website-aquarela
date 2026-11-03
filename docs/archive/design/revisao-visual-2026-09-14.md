# Revisão visual — 14/09/2026

Documento de avaliação aprovada pelo usuário em 14/09/2026; a implementação
correspondente foi autorizada em seguida.
Solicitação: aberturas internas mais consistentes e coloridas; anotação
annotation_2 em Ensino, com blocos menores, CTA lateral, lorem ipsum e reserva
de imagens na prévia. Direções incorporadas ao contrato AQ-WEB-1.1.4.

## Evidência e limites

Inspeção ao vivo das sete páginas institucionais no preview local
http://localhost:4321, viewport 1280×720, com leitura do texto completo das
páginas e inspeção visual das aberturas. Código de PageIntro e SegmentDetail
conferido. Não equivale à matriz visual B05: mobile, zoom, teclado, lightbox,
álbuns preenchidos e fotografias finais não foram auditados nesta revisão.

## Direções solicitadas e registradas no contrato

- Ensino: abertura navy/branco; Atividades: roxo/branco; Galeria: ciano/ink.
  Esta distribuição é a proposta de cores do responsável pelo design, baseada
  na solicitação de superfícies fortes da marca. Espaço/ciano,
  Aprovações/amarelo, Visite/creme e Home/creme permanecem.
- Mesmo breadcrumb, ritmo tipográfico e alinhamento entre aberturas; remover
  a linha roxa isolada de Atividades, que atualmente aumenta a altura sem
  criar uma identidade comparável às outras páginas.
- Ensino: quatro blocos verticais, mais compactos; mídia à esquerda e CTA à
  direita do texto no desktop. Empilhamento no mobile/tablet. Geometria em B06.
- Prévia de Ensino: texto sintético identificado, metadados disponíveis e
  área 4:3 para imagem, mesmo quando o conteúdo editorial estiver incompleto.

## Melhorias adicionais aprovadas

| Prioridade | Constatação | Recomendação |
| --- | --- | --- |
| Alta | Ensino repete “Fale com a equipe” e “Conversar sobre esta etapa” em cada bloco incompleto. | Na composição demonstrativa usar somente o CTA contextual; avaliar revisão separada do estado público para eliminar ações redundantes. |
| Alta | Turnos estão no conteúdo e são projetados, mas o ramo vazio de SegmentDetail os oculta. | Tornar os metadados observados visíveis na prévia conforme D10; confirmar visualmente os quatro segmentos na implementação. |
| Média | Espaço, Galeria e Aprovações têm grandes caixas vazias seguidas de outro convite para visitar. | Avaliar um EmptyState mais compacto, sem tanto fundo e espaçamento acumulados, mantendo uma saída clara e os destinos obrigatórios. |
| Média | Atividades apresenta nomes e links, mas pouca informação para comparar opções. | Priorizar resumo e público de cada modalidade quando fornecidos; não acrescentar ornamentos para compensar a falta de conteúdo. |
| Média | Na Home, o título ocupa quatro linhas em 1280 px e a mídia ainda é placeholder. | Rever equilíbrio de copy/foto com os assets finais; preservar a copy até que um texto substituto seja aprovado editorialmente. |
| Média | Visite concentra todo o conteúdo à esquerda de um painel muito largo. | Preservar a abertura creme aprovada e avaliar duas colunas internas no desktop: canais de contato e informações práticas. Empilhar no mobile. |
| Média | Os títulos internos não têm limite de 22ch no CSS de PageIntro, embora B03 o peça. | Na implementação, reconciliar a largura dos H1 com B03 e verificar quebras naturais sem fixar alturas. |
| Baixa | O rodapé já tem grupos claros e a navegação global é estável. | Preservar a organização; revisar apenas densidade e alinhamento quando os contatos finais estiverem completos. |

## Pendências de precisão percebidas na avaliação

O horário da secretaria aparece como “Segunda a sexta”. A extração do regimento
na conversa informa somente as faixas 07:30–11:30 e 13:00–17:30, sem dias da
semana. Esse complemento entrou indevidamente no lote anterior e deve ser
retirado ou confirmado na próxima edição de conteúdo. Nenhum conteúdo foi
alterado durante esta tarefa de documentação.

Os turnos registrados não estavam visíveis em Ensino nesta inspeção: corrige-se
assim a afirmação anterior de que todos já apareciam na prévia. O horário da
secretaria, por outro lado, estava visível em Visite.

## Próxima validação da proposta

Comparar aberturas lado a lado em desktop/mobile; conferir contraste de corpo,
breadcrumb e foco nas superfícies escuras; avaliar Ensino com lorem ipsum e
imagens reservadas em 390/768/1099/1100/1440 px e zoom 200%. Verificar ausência
de fixtures no público. A revisão documental não significa implementação,
aprovação editorial ou conclusão da Fase 2.
