import { type FC, type ReactNode } from 'react';

const variantColors: Record<string, string> = {
  drop: 'bg-pn-green/10 text-pn-green',
  review: 'bg-pn-cyan/10 text-pn-cyan',
  shop: 'bg-pn-amber/10 text-pn-amber',
  grid: 'bg-pn-purple/10 text-pn-purple',
  quest: 'bg-pn-blue/10 text-pn-blue',
  rank: 'bg-pn-red/10 text-pn-red',
};

interface BadgeProps {
  variant: 'drop' | 'review' | 'shop' | 'grid' | 'quest' | 'rank';
  children: ReactNode;
  className?: string;
}

const Badge: FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono uppercase tracking-wider ${variantColors[variant]} ${className}`}
      style={{ fontSize: '9px', lineHeight: '16px' }}
    >
      {children}
    </span>
  );
};

export default Badge;
