'use client';

import { type FC } from 'react';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

const Logo: FC<LogoProps> = ({ size = 32, showWordmark = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PlayNode logo"
      >
        {/* Hexagon */}
        <path
          d="M24 2L43.0526 13V35L24 46L4.94744 35V13L24 2Z"
          fill="#0A0A0B"
          stroke="#00FF88"
          strokeWidth="2"
        />
        {/* Play triangle */}
        <path
          d="M19 15L35 24L19 33V15Z"
          fill="#00FF88"
        />
      </svg>

      {showWordmark && (
        <span
          className="font-primary text-pn-white font-semibold tracking-tight"
          style={{ fontSize: size * 0.55 }}
        >
          Play<span className="text-pn-green">Node</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
