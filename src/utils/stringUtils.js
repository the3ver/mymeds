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
