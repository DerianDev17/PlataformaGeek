export const UNIVERSE_ICONS: Record<string, string> = {
  Marvel: '🦸',
  DC: '🦇',
  'Dragon Ball': '🐉',
  'One Piece': '🏴‍☠️',
  Naruto: '🍥',
  'Star Wars': '⭐',
  'Harry Potter': '⚡',
  'The Witcher': '🐺',
  Zelda: '🗡️',
  'Elden Ring': '💍',
};

export function getUniverseIcon(name: string): string {
  return UNIVERSE_ICONS[name] || '🌍';
}
