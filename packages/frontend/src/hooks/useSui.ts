'use client';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export function usePlayNode() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const isConnected = !!account;
  const address = account?.address;

  // Helper to execute a move call
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
    return signAndExecute({ transaction: tx as any });
  }

  return {
    isConnected,
    address,
    account,
    client,
    signAndExecute,
    executeMove,
  };
}
