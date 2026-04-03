'use client';

import { type FC, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Badge from './Badge';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
  badge?: string;
  badgeVariant?: 'drop' | 'review' | 'shop' | 'grid' | 'quest' | 'rank';
  className?: string;
}

const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  color = '#00FF88',
  badge,
  badgeVariant = 'drop',
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'bg-pn-surface border border-pn-border rounded-xl p-6 transition-colors duration-200 hover:border-pn-border-light relative overflow-hidden',
        className,
      )}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="text-pn-text-bright">{icon}</div>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      </div>

      <h3 className="text-pn-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-pn-muted text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
