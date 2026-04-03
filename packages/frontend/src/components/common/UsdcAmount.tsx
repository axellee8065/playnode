import { type FC } from 'react';
import clsx from 'clsx';

interface UsdcAmountProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

function formatUsdc(n: number): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const UsdcAmount: FC<UsdcAmountProps> = ({ amount, size = 'md', showLabel = false, className = '' }) => {
  return (
    <span
      className={clsx(
        'font-mono font-bold text-pn-green',
        sizeStyles[size],
        className,
      )}
    >
      ${formatUsdc(amount)}
      {showLabel && (
        <span className="ml-1 text-pn-muted font-normal" style={{ fontSize: '0.7em' }}>
          USDC
        </span>
      )}
    </span>
  );
};

export default UsdcAmount;
