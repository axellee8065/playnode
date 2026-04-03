'use client';

import { type FC, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: FC<CardProps> = ({ children, className = '', onClick }) => {
  const Comp = onClick ? motion.button : motion.div;

  return (
    <Comp
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={clsx(
        'bg-pn-surface border border-pn-border rounded-xl p-5 transition-colors duration-200 hover:border-pn-border-light',
        onClick && 'cursor-pointer text-left w-full',
        className,
      )}
    >
      {children}
    </Comp>
  );
};

export default Card;
