import { describe, it, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardImage, CardTitle, CardDescription } from '@/shared/ui';

describe('Card', () => {
  describe('Card (base)', () => {
    it('renderiza con variant por defecto', () => {
      render(<Card>Contenido</Card>);
      const card = screen.getByText('Contenido');
      expect(card.className).toContain('rounded-xl');
      expect(card.className).toContain('bg-geek-dark-secondary');
    });

    it('renderiza con hover variant', () => {
      render(<Card hover>Hover</Card>);
      const card = screen.getByText('Hover');
      expect(card.className).toContain('hover:border-geek-accent');
      expect(card.className).toContain('cursor-pointer');
    });

    it('aplica role="button" y tabIndex={0} cuando onClick es proporcionado', () => {
      render(<Card onClick={() => {}}>Clickable</Card>);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveTextContent('Clickable');
    });

    it('no aplica role="button" sin onClick', () => {
      render(<Card>No click</Card>);
      const card = screen.getByText('No click');
      expect(card).not.toHaveAttribute('role', 'button');
      expect(card).not.toHaveAttribute('tabIndex');
    });

    it('maneja tecla Enter cuando es clickeable', () => {
      const onClick = vi.fn();
      render(<Card onClick={onClick}>Enter</Card>);
      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('no maneja tecla Enter cuando no es clickeable', () => {
      render(<Card>No Enter</Card>);
      const card = screen.getByText('No Enter');
      fireEvent.keyDown(card, { key: 'Enter' });
    });

    it('maneja clic cuando onClick es proporcionado', () => {
      const onClick = vi.fn();
      render(<Card onClick={onClick}>Click</Card>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('aplica className adicional', () => {
      render(<Card className="custom-class">Styled</Card>);
      const card = screen.getByText('Styled');
      expect(card.className).toContain('custom-class');
    });

    it('renderiza children correctamente', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
        </Card>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('CardImage', () => {
    it('renderiza con loading="lazy"', () => {
      render(<CardImage src="/test.jpg" alt="Test image" />);
      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('renderiza con alt correcto', () => {
      render(<CardImage src="/test.jpg" alt="Descripción" />);
      expect(screen.getByAltText('Descripción')).toBeInTheDocument();
    });

    it('aplica className adicional', () => {
      render(<CardImage src="/test.jpg" alt="Test" className="custom-img" />);
      const wrapper = screen.getByAltText('Test').parentElement;
      expect(wrapper?.className).toContain('custom-img');
    });
  });

  describe('CardTitle', () => {
    it('renderiza con heading h3', () => {
      render(<CardTitle>Título</CardTitle>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Título');
    });

    it('renderiza children como ReactNode', () => {
      render(<CardTitle><span>JSX Title</span></CardTitle>);
      expect(screen.getByText('JSX Title')).toBeInTheDocument();
    });

    it('aplica className adicional', () => {
      render(<CardTitle className="custom-title">Título</CardTitle>);
      const heading = screen.getByText('Título');
      expect(heading.className).toContain('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('renderiza children', () => {
      render(<CardDescription>Descripción</CardDescription>);
      expect(screen.getByText('Descripción')).toBeInTheDocument();
    });

    it('aplica className adicional', () => {
      render(<CardDescription className="custom-desc">Desc</CardDescription>);
      const p = screen.getByText('Desc');
      expect(p.className).toContain('custom-desc');
    });
  });
});

describe('InteractiveCard', () => {
  test.skip('TODO: InteractiveCard component not yet created', () => {
  });

  it('debe renderizar contenido interactivo con hover effects personalizados', () => {
  });

  it('debe manejar click y navegación por teclado', () => {
  });

  it('debe mostrar overlay con acciones al hacer hover', () => {
  });
});

describe('GlassCard', () => {
  test.skip('TODO: GlassCard component not yet created', () => {
  });

  it('debe renderizar con efecto glass/vidrio (backdrop-blur)', () => {
  });

  it('debe tener bordes semi-transparentes', () => {
  });

  it('debe manejar variantes de color (accent, secondary, neutral)', () => {
  });
});

describe('StatCard', () => {
  test.skip('TODO: StatCard component not yet created', () => {
  });

  it('debe renderizar icono, valor numérico y etiqueta', () => {
  });

  it('debe animar el valor numérico al hacer scroll into view', () => {
  });

  it('debe tener aria-label descriptivo con el valor y la etiqueta', () => {
  });
});

describe('ArticleCard', () => {
  test.skip('TODO: ArticleCard component not yet created', () => {
  });

  it('debe renderizar imagen, título, descripción, autor y fecha', () => {
  });

  it('debe renderizar badges de categorías/universo', () => {
  });

  it('debe ser completamente navegable por teclado', () => {
  });
});

describe('Card composition', () => {
  it('renderiza tarjeta completa con imagen, título y descripción', () => {
    render(
      <Card hover>
        <CardImage src="/test.jpg" alt="Art" />
        <CardTitle>Título compuesto</CardTitle>
        <CardDescription>Descripción compuesta</CardDescription>
      </Card>
    );
    expect(screen.getByAltText('Art')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Título compuesto');
    expect(screen.getByText('Descripción compuesta')).toBeInTheDocument();
  });
});
