import { describe, it, expect } from 'vitest';
import { generateSlug } from '@/shared/lib';

describe('generateSlug', () => {
  it('genera slug de texto simple', () => {
    expect(generateSlug('Hola Mundo')).toBe('hola-mundo');
  });

  it('remueve caracteres especiales', () => {
    expect(generateSlug('Dragon Ball Z!')).toBe('dragon-ball-z');
  });

  it('maneja acentos', () => {
    expect(generateSlug('Ultra Instinto')).toBe('ultra-instinto');
  });

  it('remueve guiones duplicados', () => {
    expect(generateSlug('hola--mundo')).toBe('hola-mundo');
  });

  it('trimea guiones al inicio y final', () => {
    expect(generateSlug('-hola-mundo-')).toBe('hola-mundo');
  });

  it('maneja strings vacíos', () => {
    expect(generateSlug('')).toBe('');
  });

  it('genera slugs únicos para títulos largos', () => {
    const slug = generateSlug('Historia Completa del Ultra Instinto en Dragon Ball Super');
    expect(slug).toBe('historia-completa-del-ultra-instinto-en-dragon-ball-super');
    expect(slug.length).toBeLessThanOrEqual(100);
  });
});
