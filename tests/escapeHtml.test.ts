import { describe, it, expect } from 'vitest'

function escapeHtml(str: unknown): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

describe('escapeHtml', () => {
  it('escapes ampersands', () => {
    expect(escapeHtml('Penmaen & Nicholaston')).toBe('Penmaen &amp; Nicholaston')
  })

  it('escapes less-than and greater-than signs', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    )
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
  })

  it('leaves safe characters unchanged', () => {
    expect(escapeHtml('Hello, World! 123')).toBe('Hello, World! 123')
  })

  it('coerces numbers to string before escaping', () => {
    expect(escapeHtml(42)).toBe('42')
  })

  it('coerces null to string before escaping', () => {
    expect(escapeHtml(null)).toBe('null')
  })

  it('handles a string with all special characters combined', () => {
    expect(escapeHtml('<a href="foo&bar">')).toBe(
      '&lt;a href=&quot;foo&amp;bar&quot;&gt;'
    )
  })
})
