import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Button,
  Input,
  Textarea,
  Modal,
  Card,
  Avatar,
  Skeleton,
  SkeletonLine,
  EmptyState,
  ToastProvider,
  useToast,
} from '@/shared/ui';
import { StatsBanner } from '@/widgets/stats-banner/StatsBanner';
import { HeroHome } from '@/widgets/hero-home/HeroHome';

function TestToastTrigger({ message }: { message: string }) {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, 'success')}>Trigger</button>;
}

describe('Accessibilidad', () => {
  describe('Elementos interactivos tienen nombres accesibles', () => {
    it('Button tiene texto visible como nombre accesible', () => {
      render(<Button>Acción</Button>);
      expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
    });

    it('Input tiene label asociado como nombre accesible', () => {
      render(<Input label="Email" />);
      expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    });

    it('Textarea tiene label asociado como nombre accesible', () => {
      render(<Textarea label="Bio" />);
      expect(screen.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument();
    });

    it('Modal tiene aria-label como nombre accesible', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Configuración">Contenido</Modal>);
      expect(screen.getByRole('dialog', { name: 'Configuración' })).toBeInTheDocument();
    });

    it('Card clickeable tiene role="button" como nombre accesible implícito', () => {
      render(<Card onClick={() => {}}>Zona interactiva</Card>);
      expect(screen.getByRole('button', { name: 'Zona interactiva' })).toBeInTheDocument();
    });

    it('Avatar sin src tiene role="img" como nombre accesible', () => {
      render(<Avatar src={null} alt="Jane Doe" />);
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
    });

    it('EmptyState link de acción tiene nombre accesible', () => {
      render(<EmptyState title="Vacío" action={{ label: 'Volver', href: '/' }} />);
      expect(screen.getByRole('link', { name: 'Volver' })).toBeInTheDocument();
    });
  });

  describe('Controles de formulario tienen labels asociados', () => {
    it('Input con label conecta via htmlFor', () => {
      render(<Input label="Usuario" id="user-field" />);
      const input = screen.getByLabelText('Usuario');
      expect(input).toHaveAttribute('id', 'user-field');
      expect(document.querySelector('label[for="user-field"]')).toBeInTheDocument();
    });

    it('Textarea con label conecta via htmlFor', () => {
      render(<Textarea label="Mensaje" id="msg-field" />);
      const textarea = screen.getByLabelText('Mensaje');
      expect(textarea).toHaveAttribute('id', 'msg-field');
      expect(document.querySelector('label[for="msg-field"]')).toBeInTheDocument();
    });

    it('Input sin label externo sigue siendo usable', () => {
      render(<Input placeholder="Buscar" aria-label="Campo de búsqueda" />);
      const input = screen.getByPlaceholderText('Buscar');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Estados de error son anunciados', () => {
    it('Input error tiene role="alert"', () => {
      render(<Input label="Campo" error="Requerido" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
    });

    it('Textarea error tiene role="alert"', () => {
      render(<Textarea label="Campo" error="Inválido" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Inválido');
    });

    it('Input con error conecta aria-describedby al mensaje', () => {
      render(<Input label="Campo" error="Error crítico" />);
      const input = screen.getByLabelText('Campo');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      const errorEl = document.getElementById(errorId!);
      expect(errorEl).toHaveTextContent('Error crítico');
    });

    it('Input con error tiene aria-invalid="true"', () => {
      render(<Input label="Campo" error="Error" />);
      expect(screen.getByLabelText('Campo')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Gestión de foco (focus-visible)', () => {
    it('Button tiene focus-visible ring en className', () => {
      render(<Button>Focus</Button>);
      const button = screen.getByText('Focus');
      expect(button.className).toContain('focus-visible:ring-2');
      expect(button.className).toContain('focus-visible:ring-geek-accent');
    });

    it('Input tiene focus-visible ring en className', () => {
      render(<Input label="Campo" />);
      const input = screen.getByLabelText('Campo');
      expect(input.className).toContain('focus-visible:ring-2');
      expect(input.className).toContain('focus-visible:ring-geek-accent');
    });

    it('Textarea tiene focus-visible ring en className', () => {
      render(<Textarea label="Campo" />);
      const textarea = screen.getByLabelText('Campo');
      expect(textarea.className).toContain('focus-visible:ring-2');
      expect(textarea.className).toContain('focus-visible:ring-geek-accent');
    });
  });

  describe('Modal atrapa el foco', () => {
    it('Modal tiene role="dialog" y aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <button>Primero</button>
          <button>Segundo</button>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Primero')).toBeInTheDocument();
      expect(screen.getByText('Segundo')).toBeInTheDocument();
    });

    it('Escape cierra el modal', () => {
      const onClose = vi.fn();
      render(<Modal isOpen={true} onClose={onClose}>Contenido</Modal>);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('botón cerrar tiene aria-label="Cerrar"', () => {
      render(<Modal isOpen={true} onClose={() => {}} title="Modal">Info</Modal>);
      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
    });
  });

  describe('Elementos decorativos tienen aria-hidden', () => {
    it('Skeleton tiene aria-hidden="true"', () => {
      const { container } = render(<Skeleton />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });

    it('SkeletonLine wrapper tiene role="status" con label', () => {
      render(<SkeletonLine />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando');
    });

    it('StatsBanner íconos tienen aria-hidden="true"', () => {
      const stats = { universes: 1, articles: 2, characters: 3, users: 4, theories: 5 };
      const { container } = render(<StatsBanner stats={stats} />);
      const hiddenIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenIcons.length).toBeGreaterThan(0);
    });

    it('HeroHome cursor de texto tiene aria-hidden', () => {
      const { container } = render(<HeroHome />);
      const hiddenEl = container.querySelector('[aria-hidden="true"]');
      expect(hiddenEl).toBeInTheDocument();
    });
  });

  describe('Toast container tiene aria-live polite', () => {
    it('contenedor de toasts tiene aria-live="polite"', () => {
      render(
        <ToastProvider>
          <TestToastTrigger message="Test" />
        </ToastProvider>
      );
      const container = document.querySelector('[aria-live="polite"]');
      expect(container).toBeInTheDocument();
    });

    it('toast individual tiene role="status"', async () => {
      render(
        <ToastProvider>
          <TestToastTrigger message="Notificación" />
        </ToastProvider>
      );
      fireEvent.click(screen.getByText('Trigger'));
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Estados disabled son comunicados', () => {
    it('Button disabled nativo comunica estado', () => {
      render(<Button disabled>No disponible</Button>);
      expect(screen.getByText('No disponible')).toBeDisabled();
    });

    it('Input disabled nativo comunica estado', () => {
      render(<Input label="Campo" disabled />);
      expect(screen.getByLabelText('Campo')).toBeDisabled();
    });

    it('Textarea disabled nativo comunica estado', () => {
      render(<Textarea label="Campo" disabled />);
      expect(screen.getByLabelText('Campo')).toBeDisabled();
    });
  });
});
