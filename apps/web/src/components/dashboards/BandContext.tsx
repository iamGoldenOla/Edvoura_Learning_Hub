'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const BAND_STORAGE_KEY = 'edvoura_learner_band';
export type LearnerBand = '1-3' | '4-6' | '7-12';

interface BandContextValue {
  band: LearnerBand;
  setBand: (newBand: LearnerBand) => void;
}

const BandContext = createContext<BandContextValue>({
  band: '7-12',
  setBand: () => {},
});

export function BandProvider({
  initialBand,
  children,
}: {
  initialBand: LearnerBand;
  children: React.ReactNode;
}) {
  // Use server-provided band for first render to keep SSR/CSR output consistent.
  const [band, setBandState] = useState<LearnerBand>(initialBand);

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
