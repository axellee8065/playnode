'use client';

import { useWallet } from '@/components/providers/SuiProvider';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/lib/sui';

export function usePlayNode() {
  const { connected: isConnected, address, client } = useWallet();

  async function executeMove(params: {
    target: string;
    arguments: any[];
    typeArguments?: string[];
  }) {
    const tx = new Transaction();
    tx.moveCall({
      target: params.target,
      arguments: params.arguments,
      typeArguments: params.typeArguments,
    });
    // Transaction signing will be handled by wallet when available
    return tx;
  }

  return {
    isConnected,
    address,
    client,
    packageId: PACKAGE_ID,
    executeMove,
  };
}
