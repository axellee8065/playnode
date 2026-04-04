'use client';

import { type FC, useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/providers/SuiProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clapperboard, Settings, Copy, Check, LogOut } from 'lucide-react';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const UserMenu: FC = () => {
  const { connected, address, connecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  if (!connected) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-4 py-1.5 text-sm font-medium rounded-full border border-pn-border text-pn-white hover:bg-pn-surface transition-colors disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Sign In'}
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-pn-green/20 text-pn-green text-xs font-bold uppercase hover:bg-pn-green/30 transition-colors"
        aria-label="User menu"
      >
        {address!.slice(2, 4)}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-pn-surface border border-pn-border shadow-2xl overflow-hidden z-50"
          >
            {/* Navigation items */}
            <div className="px-2 py-2 flex flex-col gap-0.5">
              <a
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm text-pn-text hover:text-pn-white hover:bg-pn-surface-2 rounded-lg transition-colors"
              >
                <User size={16} className="text-pn-muted" />
                Your Channel
              </a>
              <a
                href="/studio"
                className="flex items-center gap-3 px-3 py-2 text-sm text-pn-text hover:text-pn-white hover:bg-pn-surface-2 rounded-lg transition-colors"
              >
                <Clapperboard size={16} className="text-pn-muted" />
                Curator Studio
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm text-pn-text hover:text-pn-white hover:bg-pn-surface-2 rounded-lg transition-colors"
              >
                <Settings size={16} className="text-pn-muted" />
                Settings
              </a>
            </div>

            {/* Divider + address */}
            <div className="border-t border-pn-border px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-pn-muted mb-1">
                Wallet
              </p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-xs font-mono text-pn-text hover:text-pn-white transition-colors w-full"
              >
                <span>{truncateAddress(address!)}</span>
                {copied ? (
                  <Check size={12} className="text-pn-green" />
                ) : (
                  <Copy size={12} className="text-pn-muted" />
                )}
                <span className="text-[10px] text-pn-muted ml-auto">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>

            {/* Disconnect */}
            <div className="border-t border-pn-border px-2 py-2">
              <button
                onClick={() => {
                  disconnect();
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-pn-red hover:bg-pn-red/10 rounded-lg transition-colors text-left"
              >
                <LogOut size={16} />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
