import type { ReactNode } from 'react';

interface GlassCardProps {
  className?: string;
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
}

export function GlassCard({ className = '', children, as: Component = 'div' }: GlassCardProps) {
  return (
    <Component
      className={`rounded-xl bg-geek-dark/40 backdrop-blur-md border border-geek-accent/20 shadow-[inset_0_1px_0_rgba(99,102,241,0.1)] hover:bg-geek-dark/50 hover:backdrop-blur-lg hover:border-geek-accent/40 hover:shadow-[inset_0_1px_0_rgba(99,102,241,0.2),0_8px_24px_rgba(99,102,241,0.1)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-geek-accent focus-visible:ring-offset-2 focus-visible:ring-offset-geek-dark p-6 ${className}`}
    >
      {children}
    </Component>
  );
}
