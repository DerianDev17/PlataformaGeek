import { describe, it, expect } from 'vitest';
import { sanitizeHTML, hasXSSRisk } from '@/shared/lib';

describe('sanitize', () => {
  describe('sanitizeHTML', () => {
    it('escapa tags HTML', () => {
      const result = sanitizeHTML('<script>alert(1)</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('preserva texto normal', () => {
      const result = sanitizeHTML('Hello World');
      expect(result).toBe('Hello World');
    });

    it('maneja strings vacíos', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    it('escapa caracteres especiales', () => {
      const result = sanitizeHTML('<div class="test">&');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('hasXSSRisk', () => {
    it('detecta scripts', () => {
      expect(hasXSSRisk('<script>alert(1)</script>')).toBe(true);
    });

    it('detecta event handlers', () => {
      expect(hasXSSRisk('<img src=x onerror="alert(1)">')).toBe(true);
    });

    it('detecta javascript: URLs', () => {
      expect(hasXSSRisk('javascript:alert(1)')).toBe(true);
    });

    it('detecta iframes', () => {
      expect(hasXSSRisk('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('no detecta texto normal', () => {
      expect(hasXSSRisk('Texto normal')).toBe(false);
    });

    it('no detecta HTML normal sin scripts', () => {
      expect(hasXSSRisk('<p>Hello World</p>')).toBe(false);
    });
  });
});
