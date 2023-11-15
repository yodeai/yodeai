"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { set } from 'date-fns';

// Update the type for the context value
type contextType = {
  lensId: string | null;
  setLensId: React.Dispatch<React.SetStateAction<string | null>>;
  lensName: string | null;
  setLensName: React.Dispatch<React.SetStateAction<string | null>>;
  reloadKey: number;
  reloadLenses: () => void;
  allLenses: { lens_id: number, name: string, access_type: string }[];
  // activeComponent can be "global", "lens", or "inbox"
  activeComponent: string;
  setActiveComponent: React.Dispatch<React.SetStateAction<string>>;
};


// Provide a default value for the context
const defaultValue: contextType = {
  lensId: null,
  setLensId: () => { },
  lensName: null,
  setLensName: () => { },
  reloadKey: 0,
  reloadLenses: () => { },
  allLenses: [],
  activeComponent: "global",
  setActiveComponent: () => { },
  
};

const context = createContext<contextType>(defaultValue);

// Define the type for the provider props
type LensProviderProps = {
  children: ReactNode;
};

export const useAppContext = () => {
  return useContext(context);
};

export const LensProvider: React.FC<LensProviderProps> = ({ children }) => {
  const supabase = createClientComponentClient()
  const [lensId, setLensId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [lensName, setLensName] = useState<string | null>(null);
  // allLenses is a list of the lenses that this user has, is used to suggest lenses
  const [allLenses, setAllLenses] = useState<{ lens_id: number, name: string, access_type: string }[]>([]);
  const [activeComponent, setActiveComponent] = useState<string>("global");


  useEffect(() => {
    // Get the lensId from the URL
    const path = window.location.pathname;
    const parts = path.split('/');
    // Check if the URL is '/inbox' and set isInbox to true
    if (path === '/inbox') {
      console.log("setting true");
      setActiveComponent("inbox");
    }
    else if (parts[1] === 'lens') {
      const newID = parts[2];
      setLensId(newID);  // Set the lensId based on the URL
    }

    // Get all the lenses that this user has
    fetch('/api/lens/getAllNames')
      .then(response => response.json())
      .then(data => {
        setAllLenses(data.data);
      });

  }, []);

  // This useEffect will run whenever lensId changes
  useEffect(() => {
    const fetchLensName = async () => {
      if (lensId) {  // Check if lensId is available
        const { data, error } = await supabase.from('lens').select('name').eq('lens_id', lensId);

        if (!error && data && data.length > 0) {
          setLensName(data[0].name);
          setActiveComponent("lens");
        } else {
          console.error("Error fetching lens name:" + error.message);
        }
      }
    };
    const fetchAllLenses = async () => {
      fetch('/api/lens/getAllNames')
        .then(response => response.json())
        .then(data => {
          setAllLenses(data.data);
        });
    }

    fetchLensName();
    fetchAllLenses();

  }, [lensId]);


  const reloadLenses = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  return (
    <context.Provider value={{ lensId, setLensId, lensName, setLensName, reloadKey, reloadLenses, allLenses, activeComponent, setActiveComponent }}>
      {children}
    </context.Provider>
  );
};
