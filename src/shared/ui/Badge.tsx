import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'xp';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-geek-dark-tertiary text-geek-text-secondary',
  success: 'bg-green-500/10 text-geek-success',
  warning: 'bg-yellow-500/10 text-geek-warning',
  danger: 'bg-red-500/10 text-geek-danger',
  info: 'bg-blue-500/10 text-geek-accent-secondary',
  xp: 'bg-geek-accent/10 text-geek-accent',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
