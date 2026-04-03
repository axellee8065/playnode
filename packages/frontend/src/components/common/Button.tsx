'use client';

import { type FC, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const variantStyles = {
  primary:
    'bg-pn-green text-pn-black font-semibold hover:bg-pn-green-dim active:bg-pn-green-dark disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'bg-pn-surface border border-pn-border text-pn-text hover:border-pn-border-light hover:text-pn-white disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-pn-muted hover:text-pn-text hover:bg-pn-surface disabled:opacity-40 disabled:cursor-not-allowed',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'inline-flex items-center justify-center font-primary transition-colors duration-150',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
