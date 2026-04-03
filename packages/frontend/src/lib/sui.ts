import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

export const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'testnet' | 'mainnet') || 'testnet';
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PLAYNODE_PACKAGE_ID || '';
export const REVENUE_CONFIG_ID = process.env.NEXT_PUBLIC_REVENUE_CONFIG_ID || '';

export const suiClient = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) });
