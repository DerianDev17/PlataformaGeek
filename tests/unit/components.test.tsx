import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/shared/ui';
import { Badge } from '@/shared/ui';
import { Avatar } from '@/shared/ui';
import { Skeleton } from '@/shared/ui';

describe('UI Components', () => {
  describe('Button', () => {
    it('renderiza con texto', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('aplica variant primary por defecto', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button.className).toContain('bg-geek-accent-hover');
    });

    it('aplica variant danger', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByText('Delete');
      expect(button.className).toContain('bg-geek-danger');
    });

    it('deshabilita cuando loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByText('Loading');
      expect(button).toBeDisabled();
    });

    it('deshabilita cuando disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();
    });
  });

  describe('Badge', () => {
    it('renderiza texto', () => {
      render(<Badge>Test</Badge>);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('aplica variant success', () => {
      render(<Badge variant="success">Ok</Badge>);
      const badge = screen.getByText('Ok');
      expect(badge.className).toContain('text-geek-success');
    });

    it('aplica variant danger', () => {
      render(<Badge variant="danger">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge.className).toContain('text-geek-danger');
    });
  });

  describe('Avatar', () => {
    it('muestra iniciales cuando no hay src', () => {
      render(<Avatar src={null} alt="John Doe" />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('muestra ? cuando alt está vacío', () => {
      render(<Avatar src={null} alt="" />);
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renderiza skeleton text', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('skeleton');
    });

    it('renderiza skeleton card', () => {
      const { container } = render(<Skeleton variant="card" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renderiza skeleton avatar', () => {
      const { container } = render(<Skeleton variant="avatar" />);
      expect(container.firstChild).toHaveClass('skeleton');
    });
  });

});
