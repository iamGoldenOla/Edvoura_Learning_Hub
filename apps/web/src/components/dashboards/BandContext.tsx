'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const BAND_STORAGE_KEY = 'edvoura_learner_band';

interface BandContextValue {
  band: '1-3' | '4-6' | '7-12';
  setBand: (newBand: '1-3' | '4-6' | '7-12') => void;
}

const BandContext = createContext<BandContextValue>({
  band: '7-12',
  setBand: () => {},
});

export function BandProvider({
  initialBand,
  children,
}: {
  initialBand: '1-3' | '4-6' | '7-12';
  children: React.ReactNode;
}) {
  // On first render, check localStorage for a saved band. Fall back to server-provided initialBand.
  const [band, setBandState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BAND_STORAGE_KEY);
      if (saved && ['1-3', '4-6', '7-12'].includes(saved)) {
        return saved;
      }
    }
    return initialBand;
  });

  // Whenever the band changes, persist it to localStorage
  const setBand = useCallback((newBand: '1-3' | '4-6' | '7-12') => {
    setBandState(newBand);
    if (typeof window !== 'undefined') {
      localStorage.setItem(BAND_STORAGE_KEY, newBand);
    }
  }, []);

  return (
    <BandContext.Provider value={{ band, setBand }}>
      {children}
    </BandContext.Provider>
  );
}

export function useBand() {
  return useContext(BandContext);
}
