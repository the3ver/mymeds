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
  if (!text) return '';

  const escapeHtml = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (match) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
  };

  // This regex finds both markdown links and standalone URLs.
  // Group 1 & 2: Markdown link [label](url)
  // Group 3: Standalone URL
  const combinedRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s]+)/g;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Append the text before the link
    result += escapeHtml(text.substring(lastIndex, match.index));

    let url, label, fullMatch;
    let trailingChars = '';

    if (match[1]) { // Markdown link [label](url)
      fullMatch = match[1];
      label = match[2];
      url = match[3];
    } else { // Standalone URL
      fullMatch = url = match[4];
      label = url;
      
      // Trim trailing punctuation from standalone URLs
      const punctuationRegex = /[.,?!;:]*$/;
      const trailing = url.match(punctuationRegex)[0];
      if (trailing) {
        url = url.slice(0, -trailing.length);
        label = url;
        trailingChars = trailing;
      }
    }

    result += `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>${escapeHtml(trailingChars)}`;
    lastIndex = match.index + fullMatch.length;
  }

  // Append the remaining text after the last link
  if (lastIndex < text.length) {
    result += escapeHtml(text.substring(lastIndex));
  }

  return result.replace(/\n/g, '<br>');
}
