'use client';

import type { ReactNode } from 'react';

// Wallet provider temporarily disabled for debugging
export default function ClientProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
