"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 1. Update the type for the context value
type LensContextType = {
  lensId: string | null;
  setLensId: React.Dispatch<React.SetStateAction<string | null>>;
  reloadKey: number;
  reloadLenses: () => void;
};

// Provide a default value for the context
const defaultValue: LensContextType = {
  lensId: null,
  setLensId: () => {},
  reloadKey: 0,
  reloadLenses: () => {},
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
  const [lensId, setLensId] = useState<string | null>(null); 
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    
    if (parts[1] === 'lens') {
      setLensId(parts[2]);
    }
  }, []);

  const reloadLenses = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  // Remember to return the Provider component
  return (
    <LensContext.Provider value={{ lensId, setLensId, reloadKey, reloadLenses }}>
      {children}
    </LensContext.Provider>
  );
};
