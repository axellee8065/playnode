import { usePlayNode } from './useSui';
import { useNetworkVariable } from '@/lib/sui';

export function useDrop() {
  const { executeMove, address, isConnected, client } = usePlayNode();
  const packageId = useNetworkVariable('playnodePackageId');

  async function purchaseDrop(dropId: string, price: number) {
    // Build PTB for purchasing a drop with USDC split
    return executeMove({
      target: `${packageId}::drop::purchase_drop`,
      arguments: [],
    });
  }

  return { purchaseDrop, address, isConnected };
}
