import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea, Button } from '@/shared/ui';

describe('Form Components', () => {
  describe('Input', () => {
    it('renderiza con label correctamente asociado via htmlFor', () => {
      render(<Input label="Nombre" />);
      const input = screen.getByLabelText('Nombre');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'nombre');
    });

    it('renderiza con id personalizado', () => {
      render(<Input label="Email" id="custom-email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-email');
    });

    it('muestra mensaje de error con role="alert"', () => {
      render(<Input label="Campo" error="Campo requerido" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Campo requerido');
    });

    it('establece aria-invalid cuando hay error', () => {
      render(<Input label="Campo" error="Error" />);
      const input = screen.getByLabelText('Campo');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('no establece aria-invalid sin error', () => {
      render(<Input label="Campo" />);
      const input = screen.getByLabelText('Campo');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('establece aria-describedby al error y helper IDs', () => {
      render(<Input label="Campo" error="Error" />);
      const input = screen.getByLabelText('Campo');
      expect(input).toHaveAttribute('aria-describedby', 'campo-error');
    });

    it('establece aria-describedby al helper cuando no hay error', () => {
      render(<Input label="Campo" helperText="Ayuda" />);
      const input = screen.getByLabelText('Campo');
      expect(input).toHaveAttribute('aria-describedby', 'campo-helper');
    });

    it('aplica atributo disabled', () => {
      render(<Input label="Campo" disabled />);
      const input = screen.getByLabelText('Campo');
      expect(input).toBeDisabled();
    });

    it('aplica placeholder', () => {
      render(<Input label="Campo" placeholder="Escribe aquí" />);
      const input = screen.getByLabelText('Campo');
      expect(input).toHaveAttribute('placeholder', 'Escribe aquí');
    });

    it('maneja onChange callback', () => {
      const onChange = vi.fn();
      render(<Input label="Campo" onChange={onChange} />);
      const input = screen.getByLabelText('Campo');
      fireEvent.change(input, { target: { value: 'nuevo valor' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('tiene focus-visible ring styles en className', () => {
      render(<Input label="Campo" />);
      const input = screen.getByLabelText('Campo');
      expect(input.className).toContain('focus-visible:ring-2');
      expect(input.className).toContain('focus-visible:ring-geek-accent');
    });

    it('aplica border de error cuando hay error', () => {
      render(<Input label="Campo" error="Error" />);
      const input = screen.getByLabelText('Campo');
      expect(input.className).toContain('border-geek-danger');
    });

    it('aplica border normal sin error', () => {
      render(<Input label="Campo" />);
      const input = screen.getByLabelText('Campo');
      expect(input.className).toContain('border-geek-border');
    });

    it('renderiza sin label', () => {
      render(<Input placeholder="Sin label" />);
      expect(screen.getByPlaceholderText('Sin label')).toBeInTheDocument();
    });

    it('genera id desde label con espacios', () => {
      render(<Input label="Nombre Completo" />);
      const input = screen.getByLabelText('Nombre Completo');
      expect(input).toHaveAttribute('id', 'nombre-completo');
    });
  });

  describe('Textarea', () => {
    it('renderiza con label correctamente asociado via htmlFor', () => {
      render(<Textarea label="Descripción" />);
      const textarea = screen.getByLabelText('Descripción');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('id', 'descripción');
    });

    it('renderiza con id personalizado', () => {
      render(<Textarea label="Bio" id="custom-bio" />);
      const textarea = screen.getByLabelText('Bio');
      expect(textarea).toHaveAttribute('id', 'custom-bio');
    });

    it('muestra mensaje de error con role="alert"', () => {
      render(<Textarea label="Campo" error="Muy largo" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Muy largo');
    });

    it('establece aria-invalid cuando hay error', () => {
      render(<Textarea label="Campo" error="Error" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('no establece aria-invalid sin error', () => {
      render(<Textarea label="Campo" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });

    it('establece aria-describedby al error', () => {
      render(<Textarea label="Campo" error="Error" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea).toHaveAttribute('aria-describedby', 'campo-error');
    });

    it('aplica atributo disabled', () => {
      render(<Textarea label="Campo" disabled />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea).toBeDisabled();
    });

    it('aplica placeholder', () => {
      render(<Textarea label="Campo" placeholder="Escribe..." />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea).toHaveAttribute('placeholder', 'Escribe...');
    });

    it('maneja onChange callback', () => {
      const onChange = vi.fn();
      render(<Textarea label="Campo" onChange={onChange} />);
      const textarea = screen.getByLabelText('Campo');
      fireEvent.change(textarea, { target: { value: 'nuevo texto' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('tiene focus-visible ring styles en className', () => {
      render(<Textarea label="Campo" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea.className).toContain('focus-visible:ring-2');
      expect(textarea.className).toContain('focus-visible:ring-geek-accent');
    });

    it('aplica border de error cuando hay error', () => {
      render(<Textarea label="Campo" error="Error" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea.className).toContain('border-geek-danger');
    });

    it('renderiza sin label', () => {
      render(<Textarea placeholder="Sin label" />);
      expect(screen.getByPlaceholderText('Sin label')).toBeInTheDocument();
    });
  });

  describe('Button', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;

    it.each(variants)('renderiza variante %s', (variant) => {
      render(<Button variant={variant}>Botón</Button>);
      const button = screen.getByText('Botón');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('renderiza variante primary por defecto', () => {
      render(<Button>Default</Button>);
      const button = screen.getByText('Default');
      expect(button.className).toContain('bg-geek-accent');
    });

    it('renderiza variante secondary', () => {
      render(<Button variant="secondary">Sec</Button>);
      const button = screen.getByText('Sec');
      expect(button.className).toContain('bg-geek-dark-tertiary');
    });

    it('renderiza variante ghost', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText('Ghost');
      expect(button.className).toContain('text-geek-text-secondary');
    });

    it('renderiza variante danger', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByText('Danger');
      expect(button.className).toContain('bg-geek-danger');
    });

    const sizes = ['sm', 'md', 'lg'] as const;

    it.each(sizes)('renderiza tamaño %s', (size) => {
      render(<Button size={size}>Botón</Button>);
      const button = screen.getByText('Botón');
      expect(button).toBeInTheDocument();
    });

    it('muestra spinner de carga y deshabilita cuando loading', () => {
      render(<Button loading>Cargando</Button>);
      const button = screen.getByText('Cargando');
      expect(button).toBeDisabled();
      const svg = button.querySelector('svg.animate-spin');
      expect(svg).toBeInTheDocument();
    });

    it('maneja onClick', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click</Button>);
      fireEvent.click(screen.getByText('Click'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('no establece type explícito por defecto (usa default HTML submit)', () => {
      render(<Button>Default</Button>);
      const button = screen.getByText('Default');
      expect(button.getAttribute('type')).toBeNull();
    });

    it('aplica type="submit" cuando se especifica', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('tiene focus-visible ring styles', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByText('Focus');
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-geek-accent');
    });

    it('estado disabled previene clicks', () => {
      const onClick = vi.fn();
      render(<Button disabled onClick={onClick}>Disabled</Button>);
      const button = screen.getByText('Disabled');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    it('estado disabled con loading previene clicks', () => {
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Loading</Button>);
      const button = screen.getByText('Loading');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
