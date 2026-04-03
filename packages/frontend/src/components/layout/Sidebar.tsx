'use client';

import { type FC } from 'react';
import {
  Home,
  Box,
  LayoutDashboard,
  Flame,
  Star,
  ShoppingBag,
  Grid3X3,
  Swords,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import UsdcAmount from '../common/UsdcAmount';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <Home size={18} />, label: 'Home', href: '/' },
  { icon: <Box size={18} />, label: 'My Node', href: '/node' },
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '/dashboard' },
  { icon: <Flame size={18} />, label: 'Drops', href: '/drops' },
  { icon: <Star size={18} />, label: 'Reviews', href: '/reviews' },
  { icon: <ShoppingBag size={18} />, label: 'Shop', href: '/shop' },
  { icon: <Grid3X3 size={18} />, label: 'Grid', href: '/grid' },
  { icon: <Swords size={18} />, label: 'Quests', href: '/quests' },
  { icon: <Settings size={18} />, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  collapsed?: boolean;
  activePath?: string;
}

const Sidebar: FC<SidebarProps> = ({ collapsed = false, activePath = '/' }) => {
  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16 bg-pn-dark border-r border-pn-border transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = activePath === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative',
                isActive
                  ? 'text-pn-green bg-pn-green/5'
                  : 'text-pn-muted hover:text-pn-text hover:bg-pn-surface',
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-pn-green rounded-r-full" />
              )}
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Revenue widget */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-4 bg-pn-surface rounded-xl border border-pn-border">
          <p className="font-mono text-[10px] uppercase tracking-wider text-pn-muted mb-1">
            Revenue Earned
          </p>
          <UsdcAmount amount={12458.92} size="md" />
          <p className="text-pn-muted text-xs mt-1">This month</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
