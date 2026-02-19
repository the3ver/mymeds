import { describe, it, expect } from 'vitest'
import { appendLink } from '../../src/utils/stringUtils'

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
