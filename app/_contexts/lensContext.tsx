"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the type for the context value
type LensContextType = {
  lensId: string | null;
  setLensId: React.Dispatch<React.SetStateAction<string | null>>;
};

// Provide a default value for the context
const defaultValue: LensContextType = {
  lensId: null,
  setLensId: () => {},
};

const LensContext = createContext<LensContextType>(defaultValue);

// 2. Define the type for the provider props
type LensProviderProps = {
  children: ReactNode;
};

export const useLens = () => {
  return useContext(LensContext);
};

export const LensProvider: React.FC<LensProviderProps> = ({ children }) => {
  const [lensId, setLensId] = useState<string | null>(null); // This could be initialized from local storage or a cookie

  const value = {
    lensId,
    setLensId,
  };

  return <LensContext.Provider value={value}>{children}</LensContext.Provider>;
};
