'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('playnode_wallet');
    if (saved) setAddress(saved);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      // Try all known Sui wallet detection methods
      const win = window as any;

      // Method 1: wallet-standard registry (used by Sui Wallet, Suiet, Ethos, etc.)
      const registry = win.__walletStandard__?.register
        ? win.__walletStandard__
        : null;
      const registeredWallets = registry?.wallets || [];

      // Method 2: Direct Sui wallet APIs
      const suiWallet = win.sui || win.suiWallet || win.slush;

      // Combine all found wallets
      const allWallets = registeredWallets
        .filter((w: any) => w?.features?.['standard:connect']);

      if (allWallets.length > 0) {
        // Use first compatible wallet
        const wallet = allWallets[0];
        const result = await wallet.features['standard:connect'].connect();
        if (result.accounts?.length > 0) {
          const addr = result.accounts[0].address;
          setAddress(addr);
          localStorage.setItem('playnode_wallet', addr);
          return;
        }
      }

      // Fallback: try direct Sui wallet API
      if (suiWallet) {
        const hasPermission = await suiWallet.hasPermissions?.()
          || await suiWallet.requestPermissions?.();
        if (hasPermission) {
          const accounts = await suiWallet.getAccounts();
          if (accounts?.length > 0) {
            setAddress(accounts[0]);
            localStorage.setItem('playnode_wallet', accounts[0]);
            return;
          }
        }
      }

      // No wallet found — open Sui Wallet install page
      window.open('https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
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
