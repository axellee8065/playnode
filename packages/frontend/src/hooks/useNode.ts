import { usePlayNode } from './useSui';
import { useNetworkVariable } from '@/lib/sui';

export function useNode() {
  const { executeMove, address, isConnected } = usePlayNode();
  const packageId = useNetworkVariable('playnodePackageId');

  async function createNode(displayName: string, bio: string) {
    return executeMove({
      target: `${packageId}::node::create_node`,
      arguments: [/* tx.pure.string(displayName), tx.pure.string(bio), clock */],
    });
  }

  return { createNode, address, isConnected };
}
