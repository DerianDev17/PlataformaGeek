import { describe, it, expect } from 'vitest';
import { formatDate, timeAgo } from '@/shared/lib';

describe('date utils', () => {
  describe('formatDate', () => {
    it('formatea fecha correctamente', () => {
      const result = formatDate('2024-01-15T12:00:00Z');
      expect(result).toContain('2024');
      expect(result).toContain('enero');
    });

    it('formatea en español', () => {
      const result = formatDate('2024-06-26T12:00:00Z');
      expect(result).toMatch(/junio|26/);
    });
  });

  describe('timeAgo', () => {
    it('muestra "Ahora mismo" para fechas recientes', () => {
      const now = new Date().toISOString();
      expect(timeAgo(now)).toBe('Ahora mismo');
    });

    it('muestra minutos correctamente', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = timeAgo(fiveMinAgo);
      expect(result).toContain('minuto');
    });

    it('muestra horas correctamente', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      const result = timeAgo(twoHoursAgo);
      expect(result).toContain('hora');
    });

    it('muestra días correctamente', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
      const result = timeAgo(threeDaysAgo);
      expect(result).toContain('día');
    });
  });
});
