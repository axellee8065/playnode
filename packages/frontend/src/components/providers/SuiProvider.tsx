'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { getWallets } from '@wallet-standard/core';
import { suiClient, SUI_NETWORK } from '@/lib/sui';
import type { SuiClient } from '@mysten/sui/client';

interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  client: SuiClient;
  network: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
  connected: false,
  address: null,
  connecting: false,
  client: suiClient,
  network: SUI_NETWORK,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export default function SuiProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const walletsRef = useRef<ReturnType<typeof getWallets> | null>(null);

  // Initialize wallet-standard registry + restore session
  useEffect(() => {
    walletsRef.current = getWallets();
    const saved = localStorage.getItem('playnode_wallet');
    if (saved) setAddress(saved);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // Wait a tick for wallets to register (extensions inject async)
      await new Promise((r) => setTimeout(r, 100));

      const api = walletsRef.current || getWallets();
      const wallets = api.get();

      // Find a Sui-compatible wallet with standard:connect
      const suiWallet = wallets.find((w) =>
        w.features['standard:connect'] &&
        (w.chains?.some((c: string) => c.startsWith('sui:')) || w.name?.toLowerCase().includes('sui') || w.name?.toLowerCase().includes('slush'))
      );

      if (suiWallet) {
        const connectFeature = suiWallet.features['standard:connect'] as any;
        const result = await connectFeature.connect();
        if (result.accounts?.length > 0) {
          const addr = result.accounts[0].address;
          setAddress(addr);
          localStorage.setItem('playnode_wallet', addr);
          return;
        }
      }

      // Fallback: check legacy window APIs
      const win = window as any;
      const legacy = win.sui || win.suiWallet || win.slush;
      if (legacy) {
        try {
          await legacy.requestPermissions?.();
          const accounts = await legacy.getAccounts?.();
          if (accounts?.length > 0) {
            setAddress(accounts[0]);
            localStorage.setItem('playnode_wallet', accounts[0]);
            return;
          }
        } catch { /* legacy API failed */ }
      }

      // No wallet detected — open install page
      window.open('https://chromewebstore.google.com/detail/slush-%E2%80%94-a-sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem('playnode_wallet');
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected: !!address,
        address,
        connecting,
        client: suiClient,
        network: SUI_NETWORK,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
