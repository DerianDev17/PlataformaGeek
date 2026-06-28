export type IconName =
  | 'home'
  | 'search'
  | 'planet'
  | 'user'
  | 'film'
  | 'gamepad'
  | 'book'
  | 'chip'
  | 'activity'
  | 'message'
  | 'calendar'
  | 'users'
  | 'trophy'
  | 'edit'
  | 'template'
  | 'guide'
  | 'help'
  | 'bell'
  | 'mail'
  | 'plus'
  | 'chevron'
  | 'eye'
  | 'image'
  | 'x';

interface IconProps {
  name: IconName;
  className?: string;
}

const commonProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
};

export function Icon({ name, className = 'h-4 w-4' }: IconProps) {
  const svgProps = { ...commonProps, className };

  switch (name) {
    case 'home':
      return <svg {...svgProps}><path d="m3 10 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>;
    case 'search':
      return <svg {...svgProps}><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>;
    case 'planet':
      return <svg {...svgProps}><circle cx="12" cy="12" r="5" /><path d="M3 12c3-5 15-8 18-3" /><path d="M4 15c4 3 13 4 17-2" /></svg>;
    case 'user':
      return <svg {...svgProps}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" /></svg>;
    case 'film':
      return <svg {...svgProps}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 4v16M16 4v16M4 8h4M16 8h4M4 16h4M16 16h4" /></svg>;
    case 'gamepad':
      return <svg {...svgProps}><path d="M7 16h10l2 3c1 1.5 3 .7 2.6-1.1l-1.4-7A5 5 0 0 0 15.3 7H8.7a5 5 0 0 0-4.9 3.9l-1.4 7C2 19.7 4 20.5 5 19l2-3Z" /><path d="M8 11v3M6.5 12.5h3M15 12h.01M18 12h.01" /></svg>;
    case 'book':
      return <svg {...svgProps}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></svg>;
    case 'chip':
      return <svg {...svgProps}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>;
    case 'activity':
      return <svg {...svgProps}><path d="M4 13h4l2-7 4 14 2-7h4" /></svg>;
    case 'message':
      return <svg {...svgProps}><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-5A8 8 0 1 1 21 12Z" /></svg>;
    case 'calendar':
      return <svg {...svgProps}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
    case 'users':
      return <svg {...svgProps}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>;
    case 'trophy':
      return <svg {...svgProps}><path d="M8 21h8M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3" /></svg>;
    case 'edit':
      return <svg {...svgProps}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
    case 'template':
      return <svg {...svgProps}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 9v11" /></svg>;
    case 'guide':
      return <svg {...svgProps}><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z" /><path d="M9 8h6M9 12h5" /></svg>;
    case 'help':
      return <svg {...svgProps}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.1-1.8 2.3" /><path d="M12 17h.01" /></svg>;
    case 'bell':
      return <svg {...svgProps}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
    case 'mail':
      return <svg {...svgProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case 'plus':
      return <svg {...svgProps}><path d="M12 5v14M5 12h14" /></svg>;
    case 'chevron':
      return <svg {...svgProps}><path d="m15 6-6 6 6 6" /></svg>;
    case 'eye':
      return <svg {...svgProps}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'image':
      return <svg {...svgProps}><path d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5" /></svg>;
    case 'x':
      return <svg {...svgProps}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    default:
      return null;
  }
}
