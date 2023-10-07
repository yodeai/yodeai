"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { set } from 'date-fns';

// Update the type for the context value
type LensContextType = {
  lensId: string | null;
  setLensId: React.Dispatch<React.SetStateAction<string | null>>;
  lensName: string | null;
  setLensName: React.Dispatch<React.SetStateAction<string | null>>;
  reloadKey: number;
  reloadLenses: () => void;
};


// Provide a default value for the context
const defaultValue: LensContextType = {
  lensId: null,
  setLensId: () => { },
  lensName: null,
  setLensName: () => { },
  reloadKey: 0,
  reloadLenses: () => { },
};

const LensContext = createContext<LensContextType>(defaultValue);

// Define the type for the provider props
type LensProviderProps = {
  children: ReactNode;
};

export const useLens = () => {
  return useContext(LensContext);
};

export const LensProvider: React.FC<LensProviderProps> = ({ children }) => {
  const supabase = createClientComponentClient()
  const [lensId, setLensId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [lensName, setLensName] = useState<string | null>(null);

  // This useEffect will only run once when the component is mounted
  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split('/');
    if (parts[1] === 'lens') {
      const newID = parts[2];
      setLensId(newID);  // Set the lensId based on the URL
    }
  }, []);

  // This useEffect will run whenever lensId changes
  useEffect(() => {
    const fetchLensName = async () => {
      if (lensId) {  // Check if lensId is available
        const { data, error } = await supabase.from('lens').select('name').eq('lens_id', lensId);

        if (!error && data && data.length > 0) {
          setLensName(data[0].name);
        } else {
          console.error("Error fetching lens name:", error);
        }
      }
    };

    fetchLensName();
  }, [lensId]);


  const reloadLenses = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  return (
    <LensContext.Provider value={{ lensId, setLensId, lensName, setLensName, reloadKey, reloadLenses }}>
      {children}
    </LensContext.Provider>
  );
};
