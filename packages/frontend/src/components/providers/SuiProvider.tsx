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
      // Check for Sui wallet via wallet-standard
      const wallets = (window as any).__suiWallets?.wallets ||
        (window as any).navigator?.wallets?.getWallets?.() || [];

      if (wallets.length === 0) {
        // Fallback: try window.suiWallet (Sui Wallet extension)
        const suiWallet = (window as any).suiWallet;
        if (suiWallet) {
          const permission = await suiWallet.requestPermissions();
          if (permission) {
            const accounts = await suiWallet.getAccounts();
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              localStorage.setItem('playnode_wallet', accounts[0]);
              return;
            }
          }
        }

        // No wallet found - show install prompt
        window.open('https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
        return;
      }

      // Use first available Sui wallet
      const wallet = wallets[0];
      const features = wallet.features;
      const connectFeature = features['standard:connect'];
      if (connectFeature) {
        const result = await connectFeature.connect();
        const accounts = result.accounts;
        if (accounts.length > 0) {
          const addr = accounts[0].address;
          setAddress(addr);
          localStorage.setItem('playnode_wallet', addr);
        }
      }
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
