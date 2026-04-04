'use client';
import { useState, useEffect } from 'react';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<string[]>([]); // node IDs

  useEffect(() => {
    const saved = localStorage.getItem('playnode_subscriptions');
    if (saved) setSubscriptions(JSON.parse(saved));
  }, []);

  const toggle = (nodeId: string) => {
    const updated = subscriptions.includes(nodeId)
      ? subscriptions.filter(id => id !== nodeId)
      : [...subscriptions, nodeId];
    setSubscriptions(updated);
    localStorage.setItem('playnode_subscriptions', JSON.stringify(updated));
  };

  const isSubscribed = (nodeId: string) => subscriptions.includes(nodeId);

  return { subscriptions, toggle, isSubscribed };
}
