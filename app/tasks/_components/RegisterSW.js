'use client';
import { useEffect } from 'react';

// Registered only in production builds: in dev the SW would cache HMR chunks.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW registration failed', err));
  }, []);
  return null;
}
