'use client';

import { usePlayNode } from './useSui';

export function useDrop() {
  const { executeMove, address, isConnected, packageId } = usePlayNode();

  async function purchaseDrop(dropId: string, price: number) {
    return executeMove({
      target: `${packageId}::drop::purchase_drop`,
      arguments: [],
    });
  }

  return { purchaseDrop, address, isConnected };
}
