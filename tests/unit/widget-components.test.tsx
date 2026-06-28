import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/shared/ui';
import { HeroHome } from '@/widgets/hero-home/HeroHome';

describe('Widget Components', () => {
  describe('HeroHome', () => {
    it('renderiza un heading principal accesible', () => {
      render(<HeroHome />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('tiene role="status" en el badge de comunidad activa', () => {
      render(<HeroHome />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent(/Comunidad activa/i);
    });

    it('renderiza los botones CTA con accesibilidad', () => {
      render(<HeroHome />);
      expect(screen.getByText('Explorar universos')).toBeInTheDocument();
      expect(screen.getByText('Crear articulo')).toBeInTheDocument();
    });

    it('renderiza estadisticas integradas', () => {
      render(<HeroHome />);
      expect(screen.getByText('Articulos')).toBeInTheDocument();
      expect(screen.getByText('Universos')).toBeInTheDocument();
      expect(screen.getByText('Personajes')).toBeInTheDocument();
      expect(screen.getByText('Colaboradores')).toBeInTheDocument();
    });

    it('tiene elementos decorativos con aria-hidden', () => {
      const { container } = render(<HeroHome />);
      const hiddenEl = container.querySelector('[aria-hidden="true"]');
      expect(hiddenEl).toBeInTheDocument();
    });
  });

  describe('Badge (adicional)', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info', 'xp'] as const;

    it.each(variants)('renderiza variante %s con color correcto', (variant) => {
      render(<Badge variant={variant}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toBeInTheDocument();
    });

    it('variante success tiene text-geek-success', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge.className).toContain('text-geek-success');
    });

    it('variante danger tiene text-geek-danger', () => {
      render(<Badge variant="danger">Danger</Badge>);
      const badge = screen.getByText('Danger');
      expect(badge.className).toContain('text-geek-danger');
    });

    it('variante warning tiene text-geek-warning', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge.className).toContain('text-geek-warning');
    });

    it('variante info tiene text-geek-accent-secondary', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge.className).toContain('text-geek-accent-secondary');
    });

    it('variante default tiene text-geek-text-secondary', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge.className).toContain('text-geek-text-secondary');
    });

    it('variante xp tiene text-geek-accent y bg-geek-accent/10', () => {
      render(<Badge variant="xp">XP</Badge>);
      const badge = screen.getByText('XP');
      expect(badge.className).toContain('text-geek-accent');
      expect(badge.className).toContain('bg-geek-accent/10');
    });

    const sizes = ['sm', 'md'] as const;

    it.each(sizes)('renderiza tamano %s', (size) => {
      render(<Badge size={size}>Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toBeInTheDocument();
    });

    it('renderiza tamano sm por defecto', () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge.className).toContain('text-xs');
    });

    it('aplica className adicional', () => {
      render(<Badge className="extra-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.className).toContain('extra-class');
    });
  });
});
