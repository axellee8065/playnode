import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl('testnet'),
    variables: {
      playnodePackageId: process.env.NEXT_PUBLIC_PLAYNODE_PACKAGE_ID || '',
      revenueConfigId: process.env.NEXT_PUBLIC_REVENUE_CONFIG_ID || '',
    },
  },
  mainnet: {
    url: getFullnodeUrl('mainnet'),
    variables: {
      playnodePackageId: '',
      revenueConfigId: '',
    },
  },
});

export { networkConfig, useNetworkVariable };
export const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
