/**
 * Renderizador markdown mínimo e seguro para a página de privacidade.
 * Permite apenas: parágrafos, headings #/##, listas -, links [texto](url).
 * Escapa HTML cru — nenhum HTML executável (D03).
 */

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttribute = (text: string): string =>
  escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Converte inline markdown seguro: bold, italic, links. */
const renderInline = (text: string): string => {
  // Links são validados antes de escapar e o atributo é sempre escapado.
  const links: string[] = [];
  const withPlaceholders = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (whole, label: string, href: string) => {
      try {
        const url = new URL(href);
        if (url.protocol !== 'https:') return whole;
        const marker = `\u0000${links.length}\u0000`;
        links.push(
          `<a href="${escapeAttribute(href)}" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
        );
        return marker;
      } catch {
        return whole;
      }
    },
  );
  let result = escapeHtml(withPlaceholders);
  result = result.replace(
    /\u0000(\d+)\u0000/g,
    (_, index: string) => links[Number(index)] ?? '',
  );
  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return result;
};

export const renderPrivacyMarkdown = (markdown: string): string => {
  if (!markdown.trim()) return '';

  const lines = markdown.split('\n');
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Empty line → paragraph separator
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading ##
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      out.push(`<h2>${renderInline(h2Match[1]!)}</h2>`);
      i++;
      continue;
    }

    // Heading #
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      out.push(`<h2>${renderInline(h1Match[1]!)}</h2>`);
      i++;
      continue;
    }

    // Unordered list items (- item)
    const listItems: string[] = [];
    while (i < lines.length && lines[i]!.trim().startsWith('- ')) {
      const itemText = lines[i]!.trim().slice(2);
      listItems.push(`<li>${renderInline(itemText)}</li>`);
      i++;
    }
    if (listItems.length > 0) {
      out.push(`<ul>${listItems.join('')}</ul>`);
      continue;
    }

    // Paragraph: collect consecutive non-empty lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !lines[i]!.trim().startsWith('# ') &&
      !lines[i]!.trim().startsWith('## ') &&
      !lines[i]!.trim().startsWith('- ')
    ) {
      paraLines.push(lines[i]!);
      i++;
    }
    if (paraLines.length > 0) {
      out.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
    }
  }

  return out.join('\n');
};
