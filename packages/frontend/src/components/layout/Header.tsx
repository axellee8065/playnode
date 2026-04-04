'use client';

import { type FC, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search } from 'lucide-react';
import Logo from '../common/Logo';
import ConnectWalletButton from '../common/ConnectWalletButton';

const navLinks = [
  { label: 'Explore', href: '/' },
  { label: 'Drops', href: '/drops' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Shop', href: '/shop' },
  { label: 'Grid Market', href: '/grid-market' },
  { label: 'Quests', href: '/quest' },
];

const Header: FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-pn-black/80 backdrop-blur-xl border-b border-pn-border">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: logo */}
        <a href="/" className="flex-shrink-0">
          <Logo size={28} showWordmark />
        </a>

        {/* Center: nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-pn-muted hover:text-pn-white transition-colors rounded-lg hover:bg-pn-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Search bar (desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-[240px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pn-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, reviews, games..."
              className="w-full bg-pn-surface border border-pn-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-pn-text placeholder:text-pn-muted/50 focus:outline-none focus:border-pn-green/50 transition-colors"
            />
          </div>
        </form>

        {/* Right: wallet + hamburger */}
        <div className="flex items-center gap-3">
          <ConnectWalletButton className="hidden sm:inline-flex" />

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-pn-muted hover:text-pn-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-pn-border bg-pn-black/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm text-pn-muted hover:text-pn-white transition-colors rounded-lg hover:bg-pn-surface"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 sm:hidden">
                <ConnectWalletButton className="w-full" />
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
