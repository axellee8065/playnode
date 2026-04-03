'use client';

import { type FC, useState, useRef, useEffect, useCallback } from 'react';
import { useWallet } from '@/components/providers/SuiProvider';
import { motion, AnimatePresence } from 'framer-motion';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const ConnectWalletButton: FC<{ className?: string }> = ({ className }) => {
  const { connected, address, connecting, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
        className={`px-4 py-2 text-sm font-bold rounded-lg bg-pn-green text-pn-black hover:brightness-110 transition-all disabled:opacity-50 ${className ?? ''}`}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-pn-surface border border-pn-border text-pn-white hover:border-pn-green/40 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-pn-green" />
        <span className="font-mono text-xs">{truncateAddress(address!)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-pn-surface border border-pn-border shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs text-pn-muted mb-1">Connected address</p>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 text-xs font-mono text-pn-white hover:text-pn-green transition-colors"
              >
                <span>{truncateAddress(address!)}</span>
                <span className="text-[10px] text-pn-muted">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
            <div className="px-2 py-2 flex flex-col gap-0.5">
              <a href="/dashboard" className="px-3 py-2 text-sm text-pn-muted hover:text-pn-white hover:bg-pn-black/40 rounded-lg transition-colors">
                Dashboard
              </a>
            </div>
            <div className="border-t border-pn-border px-2 py-2">
              <button
                onClick={() => { disconnect(); setOpen(false); }}
                className="w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectWalletButton;
