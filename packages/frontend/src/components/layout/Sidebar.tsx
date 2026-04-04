'use client';

import { type FC, useState } from 'react';
import {
  Home,
  TrendingUp,
  Gamepad2,
  FileText,
  Star,
  ShoppingBag,
  Target,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';
import { GAME_CATEGORIES } from '@/lib/games';

interface NavItemDef {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  collapsed?: boolean;
}

const browseItems: NavItemDef[] = [
  { icon: <Home size={20} />, label: 'Home', href: '/' },
  { icon: <TrendingUp size={20} />, label: 'Trending', href: '/?sort=trending' },
];

const discoverItems: NavItemDef[] = [
  { icon: <FileText size={20} />, label: 'Guides', href: '/drops' },
  { icon: <Star size={20} />, label: 'Reviews', href: '/reviews' },
  { icon: <ShoppingBag size={20} />, label: 'Shop', href: '/shop' },
  { icon: <Target size={20} />, label: 'Quests', href: '/quest' },
  { icon: <LayoutGrid size={20} />, label: 'Grid Market', href: '/grid-market' },
];

function NavItem({
  item,
  active,
  collapsed,
}: {
  item: NavItemDef;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <a
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={clsx(
        'flex items-center rounded-lg transition-colors',
        collapsed
          ? 'justify-center px-0 py-3'
          : 'gap-4 px-3 py-2.5',
        active
          ? 'bg-pn-surface text-pn-white font-medium'
          : 'text-pn-text hover:bg-pn-surface hover:text-pn-white text-sm',
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </a>
  );
}

const Sidebar: FC<SidebarProps> = ({ collapsed = false }) => {
  const [gamesExpanded, setGamesExpanded] = useState(false);

  // Determine active path from window (safe for SSR with fallback)
  const activePath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col fixed left-0 top-14 h-[calc(100vh-56px)] bg-pn-black border-r border-pn-border overflow-y-auto transition-all duration-200 z-30',
        collapsed ? 'w-[72px]' : 'w-[240px]',
      )}
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272F transparent' }}
    >
      {/* Browse section */}
      <div className={clsx('py-3', collapsed ? 'px-2' : 'px-3')}>
        {browseItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={activePath === item.href}
            collapsed={collapsed}
          />
        ))}

        {/* Games toggle */}
        {!collapsed ? (
          <button
            onClick={() => setGamesExpanded((prev) => !prev)}
            className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm text-pn-text hover:bg-pn-surface hover:text-pn-white transition-colors w-full"
          >
            <Gamepad2 size={20} />
            <span className="flex-1 text-left">Games</span>
            {gamesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        ) : (
          <a
            href="/"
            title="Games"
            className="flex items-center justify-center px-0 py-3 rounded-lg text-pn-text hover:bg-pn-surface hover:text-pn-white transition-colors"
          >
            <Gamepad2 size={20} />
          </a>
        )}

        {/* Game list (inline) */}
        {!collapsed && gamesExpanded && (
          <div className="ml-8 mt-1 flex flex-col gap-0.5">
            {GAME_CATEGORIES.map((game) => (
              <a
                key={game.slug}
                href={`/?game=${game.tag}`}
                className="px-3 py-1.5 rounded-md text-xs text-pn-muted hover:text-pn-white hover:bg-pn-surface transition-colors truncate"
              >
                {game.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={clsx('border-b border-pn-border', collapsed ? 'mx-2' : 'mx-3')} />

      {/* Discover section */}
      <div className={clsx('py-3', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] uppercase tracking-wider text-pn-muted font-semibold">
            Discover
          </p>
        )}
        {discoverItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={activePath === item.href}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* Divider */}
      <div className={clsx('border-b border-pn-border', collapsed ? 'mx-2' : 'mx-3')} />

      {/* Footer */}
      <div className="mt-auto py-4 px-3">
        {!collapsed && (
          <p className="text-[10px] text-pn-muted text-center">
            &copy; 2026 PlayNode
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
