import type { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="text-geek-text-secondary mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-geek-text font-heading">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-geek-text-secondary max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium bg-geek-accent-hover text-white hover:bg-geek-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-geek-accent focus-visible:ring-offset-2 focus-visible:ring-offset-geek-dark px-4 py-2 text-sm font-bold"
            >
              {action.label}
            </a>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
