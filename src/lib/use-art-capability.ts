'use client';
import { useEffect, useState } from 'react';

export function useArtCapability() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }
    ).connection;
    const update = () => setAllowed(!reduced.matches && !connection?.saveData);
    update();
    reduced.addEventListener('change', update);
    connection?.addEventListener?.('change', update);
    return () => {
      reduced.removeEventListener('change', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);
  return allowed;
}
