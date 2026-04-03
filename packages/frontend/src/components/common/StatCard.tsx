import { type FC } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  className?: string;
}

const StatCard: FC<StatCardProps> = ({ label, value, change, className = '' }) => {
  const isPositive = change && !change.startsWith('-');

  return (
    <div
      className={clsx(
        'bg-pn-surface border border-pn-border rounded-xl p-5',
        className,
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-2">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className="text-pn-white font-bold text-2xl leading-none">
          {value}
        </span>
        {change && (
          <span
            className={clsx(
              'font-mono text-xs font-medium mb-0.5',
              isPositive ? 'text-pn-green' : 'text-pn-red',
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
