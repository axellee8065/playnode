'use client';

import { type FC, useState, type FormEvent } from 'react';
import { Search, Plus, Menu, X, ArrowLeft } from 'lucide-react';
import Logo from '../common/Logo';
import UserMenu from './UserMenu';

const Header: FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 h-14 bg-pn-black/95 backdrop-blur border-b border-pn-border">
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile search overlay */}
        {mobileSearchOpen ? (
          <div className="flex items-center gap-2 w-full sm:hidden">
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="flex-shrink-0 p-2 text-pn-muted hover:text-pn-white transition-colors"
              aria-label="Close search"
            >
              <ArrowLeft size={20} />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides, reviews, games..."
                autoFocus
                className="w-full bg-pn-surface border border-pn-border rounded-full px-5 py-2 text-sm text-pn-text placeholder:text-pn-muted/50 focus:outline-none focus:border-pn-green/50 transition-colors"
              />
            </form>
          </div>
        ) : (
          <>
            {/* Left section */}
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleSidebar}
                className="p-2 text-pn-muted hover:text-pn-white transition-colors md:hidden"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
              <a href="/" className="flex items-center gap-2">
                <Logo size={24} />
                <span className="font-bold text-lg">
                  <span className="text-pn-white">Play</span>
                  <span className="text-pn-green">Node</span>
                </span>
              </a>
            </div>

            {/* Center: search (desktop) */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-[600px] mx-auto items-center"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guides, reviews, games..."
                  className="w-full bg-pn-surface border border-pn-border rounded-full px-5 py-2 pr-12 text-sm text-pn-text placeholder:text-pn-muted/50 focus:outline-none focus:border-pn-green/50 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pn-surface-2 text-pn-muted hover:text-pn-white hover:bg-pn-surface-3 transition-colors"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {/* Create button */}
              <a
                href="/drops/create"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pn-surface-2 text-pn-text text-sm hover:bg-pn-surface-3 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Create</span>
              </a>

              {/* User menu */}
              <UserMenu />

              {/* Mobile search toggle */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 text-pn-muted hover:text-pn-white transition-colors sm:hidden"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
