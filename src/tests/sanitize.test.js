import { describe, it, expect } from 'vitest';
import { escapeHtml, stripTags, stripControlChars, sanitizeUrl, sanitizeFull } from '../utils/sanitize';

describe('sanitize — escapeHtml', () => {
  it('escapes all OWASP-recommended HTML entities', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    expect(escapeHtml("it's")).toBe('it&#x27;s');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('a/b')).toBe('a&#x2F;b');
    expect(escapeHtml('`code`')).toBe('&#96;code&#96;');
  });

  it('returns empty string for null, undefined, non-string inputs', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml(123)).toBe('');
  });

  it('preserves safe alphanumeric strings', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });
});

describe('sanitize — stripTags', () => {
  it('removes all HTML tags', () => {
    expect(stripTags('<b>bold</b>')).toBe('bold');
    expect(stripTags('<script>alert(1)</script>')).toBe('alert(1)');
    expect(stripTags('<div class="x">content</div>')).toBe('content');
  });

  it('returns empty for non-string', () => {
    expect(stripTags(null)).toBe('');
    expect(stripTags(undefined)).toBe('');
  });
});

describe('sanitize — stripControlChars', () => {
  it('removes control characters but keeps newlines and tabs', () => {
    expect(stripControlChars('hello\x00world')).toBe('helloworld');
    expect(stripControlChars('line1\nline2')).toBe('line1\nline2');
    expect(stripControlChars('col1\tcol2')).toBe('col1\tcol2');
  });

  it('returns empty for non-string', () => {
    expect(stripControlChars(null)).toBe('');
  });
});

describe('sanitize — sanitizeUrl', () => {
  it('allows valid http and https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    expect(sanitizeUrl('http://example.com/path')).toContain('http://example.com/path');
  });

  it('allows mailto URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toContain('mailto:');
  });

  it('rejects javascript and data URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('returns empty for invalid URLs', () => {
    expect(sanitizeUrl('not_a_valid_url')).toBe('');
    expect(sanitizeUrl('')).toBe('');
    expect(sanitizeUrl(null)).toBe('');
  });
});

describe('sanitize — sanitizeFull', () => {
  it('applies full sanitization pipeline', () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizeFull(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('alert');
  });

  it('truncates to maxLength', () => {
    const long = 'a'.repeat(3000);
    expect(sanitizeFull(long, 100).length).toBe(100);
  });

  it('uses default maxLength of 2000', () => {
    const long = 'a'.repeat(3000);
    expect(sanitizeFull(long).length).toBe(2000);
  });

  it('returns empty for non-string', () => {
    expect(sanitizeFull(null)).toBe('');
    expect(sanitizeFull(undefined)).toBe('');
    expect(sanitizeFull(42)).toBe('');
  });
});
