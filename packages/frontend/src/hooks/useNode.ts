'use client';

import { usePlayNode } from './useSui';

export function useNode() {
  const { executeMove, address, isConnected, packageId } = usePlayNode();

  async function createNode(displayName: string, bio: string) {
    return executeMove({
      target: `${packageId}::node::create_node`,
      arguments: [],
    });
  }

  return { createNode, address, isConnected };
}
