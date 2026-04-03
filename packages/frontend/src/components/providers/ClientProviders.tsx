'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

const SuiProvider = dynamic(() => import('./SuiProvider'), { ssr: false });

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <SuiProvider>{children}</SuiProvider>;
}
