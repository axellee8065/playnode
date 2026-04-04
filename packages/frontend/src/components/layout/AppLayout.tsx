'use client';

import { type FC, type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AppLayoutProps {
  children: ReactNode;
  activePath?: string;
  rightPanel?: ReactNode;
}

const AppLayout: FC<AppLayoutProps> = ({ children, activePath = '/', rightPanel }) => {
  return (
    <div className="min-h-screen bg-pn-black flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6">
            <div className={rightPanel ? 'grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6' : ''}>
              <div>{children}</div>
              {rightPanel && (
                <aside className="hidden xl:block">{rightPanel}</aside>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-pn-dark/95 backdrop-blur-xl border-t border-pn-border">
        <div className="flex items-center justify-around h-14 px-2">
          {[
            { label: 'Home', href: '/' },
            { label: 'Drops', href: '/drops' },
            { label: 'Shop', href: '/shop' },
            { label: 'Quests', href: '/quests' },
            { label: 'More', href: '/menu' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 ${
                activePath === item.href ? 'text-pn-green' : 'text-pn-muted'
              }`}
            >
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
