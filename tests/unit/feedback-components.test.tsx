import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ToastProvider, useToast, EmptyState, Skeleton, SkeletonLine } from '@/shared/ui';

function TestToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>Show Toast</button>;
}

function TestToastComponent({ message, type }: { message: string; type?: 'success' | 'error' | 'info' | 'warning' }) {
  return (
    <ToastProvider>
      <TestToastTrigger message={message} type={type} />
    </ToastProvider>
  );
}

describe('Feedback Components', () => {
  describe('Modal', () => {
    it('renderiza cuando isOpen es true', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Test Modal">Contenido</Modal>);
      expect(screen.getByText('Contenido')).toBeInTheDocument();
    });

    it('no renderiza cuando isOpen es false', () => {
      render(<Modal isOpen={false} onClose={() => {}} title="Test Modal">Contenido</Modal>);
      expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    it('tiene role="dialog" y aria-modal="true"', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Dialogo">Info</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('tiene aria-label correcto basado en title', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Mi Modal">Info</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Mi Modal');
    });

    it('cierra al presionar Escape', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose}>Contenido</Modal>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('no cierra con tecla distinta a Escape', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose}>Contenido</Modal>);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('botón cerrar funciona', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose} title="Cerrar test">Info</Modal>);
      const closeButton = screen.getByLabelText('Cerrar');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renderiza título cuando se proporciona', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Título Modal">Contenido</Modal>);
      expect(screen.getByText('Título Modal')).toBeInTheDocument();
    });

    it('no renderiza título cuando no se proporciona', () => {
      render(<Modal isOpen={true} onClose={() => {}}>Contenido</Modal>);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renderiza children correctamente', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Párrafo 1</p>
          <p>Párrafo 2</p>
        </Modal>
      );
      expect(screen.getByText('Párrafo 1')).toBeInTheDocument();
      expect(screen.getByText('Párrafo 2')).toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('renderiza toast message al llamar showToast', async () => {
      render(<TestToastComponent message="Operación exitosa" type="success" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
      });
    });

    it('cada toast individual tiene role="status"', async () => {
      render(<TestToastComponent message="Mensaje" type="info" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });

    it('contenedor tiene aria-live="polite"', () => {
      render(<TestToastComponent message="Test" type="info" />);
      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });

    it('tiene botón cerrar con aria-label="Cerrar"', async () => {
      render(<TestToastComponent message="Toast" type="info" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
      });
    });

    it('renderiza variante success con estilos correctos', async () => {
      render(<TestToastComponent message="Éxito" type="success" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast.className).toContain('border-geek-success');
        expect(toast.className).toContain('bg-green-500/10');
      });
    });

    it('renderiza variante error con estilos correctos', async () => {
      render(<TestToastComponent message="Error" type="error" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast.className).toContain('border-geek-danger');
        expect(toast.className).toContain('bg-red-500/10');
      });
    });

    it('renderiza variante warning con estilos correctos', async () => {
      render(<TestToastComponent message="Warning" type="warning" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast.className).toContain('border-geek-warning');
        expect(toast.className).toContain('bg-yellow-500/10');
      });
    });

    it('renderiza variante info por defecto', async () => {
      render(<TestToastComponent message="Info" type="info" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast.className).toContain('border-geek-accent');
      });
    });

    it('cierra toast al hacer clic en botón cerrar', async () => {
      render(<TestToastComponent message="Desaparece" type="info" />);
      fireEvent.click(screen.getByText('Show Toast'));
      await waitFor(() => {
        expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByLabelText('Cerrar'));
      await waitFor(() => {
        expect(screen.queryByText('Desaparece')).not.toBeInTheDocument();
      });
    });
  });

  describe('EmptyState', () => {
    it('renderiza título y descripción', () => {
      render(<EmptyState title="No data" description="Nothing here" />);
      expect(screen.getByText('No data')).toBeInTheDocument();
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renderiza sin descripción', () => {
      render(<EmptyState title="Solo título" />);
      expect(screen.getByText('Solo título')).toBeInTheDocument();
    });

    it('renderiza botón de acción con onClick', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No data"
          action={{ label: 'Add item', onClick }}
        />
      );
      const button = screen.getByText('Add item');
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renderiza enlace de acción cuando href es proporcionado', () => {
      render(
        <EmptyState
          title="No data"
          action={{ label: 'Go home', href: '/home' }}
        />
      );
      const link = screen.getByRole('link', { name: 'Go home' });
      expect(link).toHaveAttribute('href', '/home');
    });

    it('renderiza icono cuando se proporciona', () => {
      render(<EmptyState title="Empty" icon={<span data-testid="icon">🔍</span>} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('no renderiza icono cuando no se proporciona', () => {
      render(<EmptyState title="Empty" />);
      const iconContainer = document.querySelector('.text-geek-text-secondary.mb-4');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renderiza skeleton text por defecto con aria-hidden="true"', () => {
      const { container } = render(<Skeleton />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).toHaveClass('skeleton');
    });

    it('renderiza skeleton avatar con aria-hidden="true"', () => {
      const { container } = render(<Skeleton variant="avatar" />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).toHaveClass('rounded-full');
    });

    it('renderiza skeleton image con aria-hidden="true"', () => {
      const { container } = render(<Skeleton variant="image" />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(el).toHaveClass('h-40');
    });

    it('renderiza skeleton card con aria-hidden="true"', () => {
      const { container } = render(<Skeleton variant="card" />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });

    it('SkeletonLine wrapper tiene role="status" y aria-label="Cargando"', () => {
      render(<SkeletonLine count={3} />);
      const wrapper = screen.getByRole('status');
      expect(wrapper).toHaveAttribute('aria-label', 'Cargando');
    });

    it('SkeletonLine renderiza número correcto de skeletons', () => {
      render(<SkeletonLine count={5} />);
      const wrapper = screen.getByRole('status');
      const skeletons = wrapper.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(5);
    });

    it('SkeletonLine renderiza 3 por defecto', () => {
      render(<SkeletonLine />);
      const wrapper = screen.getByRole('status');
      const skeletons = wrapper.querySelectorAll('.skeleton');
      expect(skeletons.length).toBe(3);
    });

    it('SkeletonLine incluye texto sr-only para screen readers', () => {
      render(<SkeletonLine />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('Skeleton default variant tiene clases base skeleton', () => {
      const { container } = render(<Skeleton />);
      const el = container.firstChild as HTMLElement;
      expect(el.className).toContain('skeleton');
      expect(el.className).toContain('rounded');
    });
  });
});
