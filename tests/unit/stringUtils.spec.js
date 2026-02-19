import { describe, it, expect } from 'vitest'
import { appendLink, renderMarkdownLinks } from '../../src/modules/common/utils/stringUtils'

describe('appendLink', () => {
  const link = { url: 'https://example.com', label: 'Example' }
  const linkWithoutLabel = { url: 'https://example.com' }

  it('should append a link with a label to an empty text', () => {
    const result = appendLink('', link)
    expect(result).toBe('[Example](https://example.com)')
  })

  it('should append a link without a label to an empty text', () => {
    const result = appendLink('', linkWithoutLabel)
    expect(result).toBe('https://example.com')
  })

  it('should append a link to existing text, adding a space', () => {
    const result = appendLink('Hello world', link)
    expect(result).toBe('Hello world [Example](https://example.com)')
  })

  it('should not add an extra space if the text already ends with one (BUGFIX TEST)', () => {
    const result = appendLink('Hello world ', link)
    expect(result).toBe('Hello world [Example](https://example.com)')
  })

  it('should handle null or undefined initial text', () => {
    const result = appendLink(null, link)
    expect(result).toBe('[Example](https://example.com)')
    const result2 = appendLink(undefined, linkWithoutLabel)
    expect(result2).toBe('https://example.com')
  })

  it('should not change the text if the URL is missing', () => {
    const result = appendLink('Some text', { label: 'No URL' })
    expect(result).toBe('Some text')
  })

  it('should append a link without a label to existing text', () => {
    const result = appendLink('Check this', linkWithoutLabel)
    expect(result).toBe('Check this https://example.com')
  })
  
  it('should not add a space if the initial text is empty', () => {
    const result = appendLink('', link)
    expect(result).toBe('[Example](https://example.com)')
  })
});

describe('renderMarkdownLinks', () => {
  it('should return an empty string for null or empty input', () => {
    expect(renderMarkdownLinks(null)).toBe('')
    expect(renderMarkdownLinks('')).toBe('')
  })

  it('should convert a simple markdown link', () => {
    const text = 'Check out [this link](https://example.com)'
    const expected = 'Check out <a href="https://example.com" target="_blank" rel="noopener noreferrer">this link</a>'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })

  it('should convert a standalone URL', () => {
    const text = 'Go to https://example.com for more info'
    const expected = 'Go to <a href="https://example.com" target="_blank" rel="noopener noreferrer">https://example.com</a> for more info'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })

  it('should handle multiple links of different types', () => {
    const text = 'My favorite sites are [Google](https://google.com) and https://bing.com.'
    const expected = 'My favorite sites are <a href="https://google.com" target="_blank" rel="noopener noreferrer">Google</a> and <a href="https://bing.com" target="_blank" rel="noopener noreferrer">https://bing.com</a>.'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })

  it('should correctly render text before, between, and after links (BUGFIX TEST)', () => {
    const text = 'Here is a text with [Link](http://bing.com/) and even more text after the link.'
    const expected = 'Here is a text with <a href="http://bing.com/" target="_blank" rel="noopener noreferrer">Link</a> and even more text after the link.'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })

  it('should escape HTML in plain text parts', () => {
    const text = '<script>alert("XSS")</script> and a [safe link](https://safe.com)'
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; and a <a href="https://safe.com" target="_blank" rel="noopener noreferrer">safe link</a>'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })

  it('should escape HTML inside link labels', () => {
    const text = '[<img src=x onerror=alert(1)>](https://safe.com)'
    const expected = '<a href="https://safe.com" target="_blank" rel="noopener noreferrer">&lt;img src=x onerror=alert(1)&gt;</a>'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })
  
  it('should handle newlines correctly', () => {
    const text = 'First line.\nSecond line with a [link](https://example.com).'
    const expected = 'First line.<br>Second line with a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>.'
    expect(renderMarkdownLinks(text)).toBe(expected)
  })
});
