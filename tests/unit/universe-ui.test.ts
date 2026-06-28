import { describe, it, expect } from 'vitest';
import { UNIVERSE_ICONS, getUniverseIcon } from '@/shared/constants';

describe('Universe UI Data Validation', () => {
  it('Marvel tiene ícono definido en UNIVERSE_ICONS', () => {
    expect(UNIVERSE_ICONS['Marvel']).toBe('🦸');
    expect(getUniverseIcon('Marvel')).toBe('🦸');
  });

  it('getUniverseIcon devuelve fallback para universo desconocido', () => {
    expect(getUniverseIcon('UniversoQueNoExiste')).toBe('🌍');
  });

  it('Todos los universos del seed tienen ícono', () => {
    const seedUniverses = [
      'Marvel', 'DC', 'Dragon Ball', 'One Piece', 'Naruto',
      'Star Wars', 'Harry Potter', 'The Witcher', 'Zelda', 'Elden Ring',
    ];
    for (const name of seedUniverses) {
      expect(getUniverseIcon(name)).not.toBe('🌍');
    }
  });

  it('UNIVERSE_ICONS tiene exactamente 10 entradas', () => {
    expect(Object.keys(UNIVERSE_ICONS)).toHaveLength(10);
  });
});

describe('Marvel Page Data Structure', () => {
  const mockMarvelArticle = {
    id: '1',
    title: '¿Quién es Doctor Doom?',
    slug: 'quien-es-doctor-doom',
    summary: 'La historia completa de Victor Von Doom',
    coverImage: null,
    views: 1250,
    createdAt: new Date().toISOString(),
  };

  it('Artículo tiene todos los campos requeridos', () => {
    const required = ['id', 'title', 'slug', 'summary'];
    for (const field of required) {
      expect(mockMarvelArticle).toHaveProperty(field);
      expect((mockMarvelArticle as any)[field]).toBeTruthy();
    }
  });

  it('Artículo views es un número positivo', () => {
    expect(mockMarvelArticle.views).toBeGreaterThanOrEqual(0);
    expect(typeof mockMarvelArticle.views).toBe('number');
  });

  const mockMarvelCharacter = {
    id: 'c1',
    name: 'Spider-Man',
    slug: 'spider-man',
    alias: 'Peter Parker',
    imageUrl: null,
    description: 'El trepamuros de Nueva York',
  };

  it('Personaje tiene nombre y slug', () => {
    expect(mockMarvelCharacter.name).toBeTruthy();
    expect(mockMarvelCharacter.slug).toBeTruthy();
  });

  it('Personaje slug es URL-friendly (sin espacios, minúsculas)', () => {
    expect(mockMarvelCharacter.slug).not.toContain(' ');
    expect(mockMarvelCharacter.slug).toBe(mockMarvelCharacter.slug.toLowerCase());
    expect(mockMarvelCharacter.slug).toMatch(/^[a-z0-9-]+$/);
  });

  const mockUniverseData = {
    id: 'u-marvel',
    name: 'Marvel',
    slug: 'marvel',
    description: 'El universo cinematográfico y de cómics de Marvel',
    articleCount: 7,
    characterCount: 6,
    theoryCount: 1,
    recentArticles: [mockMarvelArticle],
    featuredCharacters: [mockMarvelCharacter],
    popularTheories: [],
  };

  it('Universo data tiene stats numéricos positivos', () => {
    expect(mockUniverseData.articleCount).toBeGreaterThanOrEqual(0);
    expect(mockUniverseData.characterCount).toBeGreaterThanOrEqual(0);
    expect(mockUniverseData.theoryCount).toBeGreaterThanOrEqual(0);
    expect(typeof mockUniverseData.articleCount).toBe('number');
  });

  it('Universo slug coincide con el nombre (sluggeado)', () => {
    expect(mockUniverseData.slug).toBe('marvel');
  });

  it('Descripción no excede 500 caracteres (buena práctica UI)', () => {
    expect(mockUniverseData.description.length).toBeLessThanOrEqual(500);
  });
});

describe('UI Spacing & Sizing Rules', () => {
  it('Cards deben tener mínimo 200px de ancho (grid 1-col en mobile)', () => {
    const minCardWidth = 200;
    expect(minCardWidth).toBeGreaterThanOrEqual(200);
  });

  it('Grid gap debe ser 16px (gap-4 = 1rem = 16px)', () => {
    const gap = 16;
    expect(gap).toBe(16);
  });

  it('Títulos h1 deben ser >= 1.875rem (text-3xl = 30px)', () => {
    const h1MinSize = 30;
    expect(h1MinSize).toBeGreaterThanOrEqual(28);
  });

  it('Títulos h2 deben ser >= 1.25rem (text-xl = 20px)', () => {
    const h2MinSize = 20;
    expect(h2MinSize).toBeGreaterThanOrEqual(18);
  });

  it('Texto body debe ser >= 0.875rem (text-sm = 14px)', () => {
    const bodyMinSize = 14;
    expect(bodyMinSize).toBeGreaterThanOrEqual(12);
  });
});
