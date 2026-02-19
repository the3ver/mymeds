/**
 * Appends a markdown link to a given text.
 * Ensures that there is exactly one space between the existing text and the new link.
 *
 * @param {string} currentText The text to append to.
 * @param {object} link
 * @param {string} link.url The URL of the link.
 * @param {string} [link.label] The optional label for the link.
 * @returns {string} The updated text.
 */
export function appendLink(currentText, { url, label }) {
  if (!url) return currentText

  const linkText = label ? `[${label}](${url})` : url
  const text = currentText || ''

  if (text && !text.endsWith(' ')) {
    return text + ' ' + linkText
  }
  
  return text + linkText
}

/**
 * Renders a string with markdown-style links into safe HTML.
 * It handles both [label](url) and standalone URLs.
 *
 * @param {string} text The input text.
 * @returns {string} HTML string with <a> tags.
 */
export function renderMarkdownLinks(text) {
  if (!text) return ''

  const escapeHtml = (str) => str.replace(/[&<>"']/g, (match) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[match]));

  const combinedRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Append the text before the link
    result += escapeHtml(text.substring(lastIndex, match.index));

    if (match[1] && match[2]) { // Markdown link: [label](url)
      result += `<a href="${escapeHtml(match[2])}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[1])}</a>`;
    } else if (match[3]) { // Standalone URL
      result += `<a href="${escapeHtml(match[3])}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[3])}</a>`;
    }

    lastIndex = match.index + match[0].length;
  }

  // Append the remaining text after the last link
  if (lastIndex < text.length) {
    result += escapeHtml(text.substring(lastIndex));
  }

  return result.replace(/\n/g, '<br>');
}
