'use client';

import { type FC, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

interface CategoryBarProps {
  items: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}

const CategoryBar: FC<CategoryBarProps> = ({ items, active, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const allItems = [{ label: 'All', value: 'all' }, ...items];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 8);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className="sticky top-14 z-40 bg-pn-black border-b border-pn-border">
      <div className="relative">
        {/* Left fade */}
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-pn-black to-transparent z-10 pointer-events-none" />
        )}

        {/* Right fade */}
        {showRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-pn-black to-transparent z-10 pointer-events-none" />
        )}

        {/* Scrollable pills */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allItems.map((item) => (
            <button
              key={item.value}
              onClick={() => onChange(item.value)}
              className={clsx(
                'flex-shrink-0 px-4 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap',
                active === item.value
                  ? 'bg-pn-white text-pn-black font-semibold'
                  : 'bg-pn-surface-2 text-pn-text hover:bg-pn-surface-3',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
