"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel, RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { Lens } from 'app/_types/lens';
import { getSortingOptionsFromLocalStorage, setSortingOptionsToLocalStorage } from '@utils/localStorage';

// Update the type for the context value
export type contextType = {
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

  pinnedLensesLoading: boolean;
  pinnedLenses: Lens[];
  setPinnedLenses: React.Dispatch<React.SetStateAction<Lens[]>>;
  accessType: "owner" | "editor" | "reader",
  setAccessType: React.Dispatch<React.SetStateAction<string>>;

  layoutRefs: {
    sidebar: React.RefObject<HTMLDivElement>;
  },

  draggingNewBlock: boolean;
  setDraggingNewBlock: React.Dispatch<React.SetStateAction<boolean>>;

  sortingOptions: {
    order: "asc" | "desc",
    sortBy: null | "name" | "createdAt" | "updatedAt"
  },
  setSortingOptions: React.Dispatch<React.SetStateAction<contextType["sortingOptions"]>>;

  onboardingStep: number;
  onboardingIsComplete: boolean;
  goToNextOnboardingStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
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

  pinnedLensesLoading: true,
  pinnedLenses: [],
  setPinnedLenses: () => { },
  accessType: "owner",
  setAccessType: () => { },

  layoutRefs: {
    sidebar: React.createRef<HTMLDivElement>(),
  },

  draggingNewBlock: false,
  setDraggingNewBlock: () => { },

  sortingOptions: getSortingOptionsFromLocalStorage() ?? {
    order: "asc",
    sortBy: null
  },
  setSortingOptions: () => { },

  onboardingStep: 0,
  onboardingIsComplete: false,
  goToNextOnboardingStep: () => { },
  completeOnboarding: () => { },
  resetOnboarding: () => { }
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
  const [allLenses, setAllLenses] = useState<{ lens_id: number, name: string, access_type: string; pinned: true }[]>([]);
  const [pinnedLensesLoading, setPinnedLensesLoading] = useState(true);
  const [pinnedLenses, setPinnedLenses] = useState<Lens[]>([]);
  const [activeComponent, setActiveComponent] = useState<"global" | "lens" | "myblocks" | "inbox">("global");
  const [accessType, setAccessType] = useState<contextType["accessType"]>(null);
  const [draggingNewBlock, setDraggingNewBlock] = useState(false);
  const [sortingOptions, setSortingOptions] = useState<contextType["sortingOptions"]>(defaultValue.sortingOptions);

  // Onboarding Context Data
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingIsComplete, setOnboardingIsComplete] = useState(false);

  const goToNextOnboardingStep = () => {
    setOnboardingStep((currentStep) => currentStep + 1);
    console.log("going to next step");
  };

  const resetOnboarding = () => {
    setOnboardingStep(0);
    console.log("resetting onboarding step");
  };

  const completeOnboarding = () => {
    setOnboardingIsComplete(true);
    // Update the database to indicate the user has completed onboarding
    // (This function needs to be implemented based on your Supabase setup)
  };

  const layoutRefs = {
    sidebar: React.createRef<HTMLDivElement>(),
  }

  const getAllLenses = async () => {
    return fetch('/api/lens/getAllNames')
      .then(response => response.json())
      .then(data => {
        setAllLenses(data.data);
        setReloadKey(prevKey => prevKey + 1);
      });
  }

  const getPinnedLenses = async () => {
    fetch(`/api/lens/pinneds`)
      .then((response) => response.json())
      .then((data) => {
        setPinnedLenses(data.data);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        // notFound();
      }).finally(() => {
        setPinnedLensesLoading(false);
      })
  }

  useEffect(() => {
    // Get the lensId from the URL
    const path = window.location.pathname;
    const parts = path.split('/');
    // Check if the URL is '/inbox' and set isInbox to true
    if (path === '/inbox') {
      setActiveComponent("inbox");
    }
    if (path === '/myblocks') {
      setActiveComponent("myblocks");
    }

    else if (parts[1] === 'lens') {
      console.log("setting app context to be ", parts[parts.length - 1])
      setLensId(parts[parts.length - 1]);  // Set the lensId based on the URL
    }

    // Get all the lenses that this user has
    getAllLenses();
    getPinnedLenses();
  }, []);

  useEffect(() => {
    let channel: RealtimeChannel;

    (async () => {
      const user_id = (await supabase.auth?.getUser())?.data?.user?.id;
      if (!user_id) return;

      console.log("Subscribing to pinned_lens changes...")

      channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lens_users', filter: `user_id=eq.${user_id}` }, getPinnedLenses)
      if (lensId) channel = channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lens_published', filter: `lens_id=eq.${lensId}` }, getPinnedLenses)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lens', filter: `lens_id=eq.${lensId}` }, getPinnedLenses)

      channel.subscribe();
    })();

    return () => {
      if (channel) {
        channel.unsubscribe();
        console.log("Unsubscribed from pinned_lens changes")
      }
    };
  }, [lensId])

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

    fetchLensName();
    getAllLenses();

  }, [lensId]);

  useEffect(() => {
    setSortingOptionsToLocalStorage(sortingOptions);
  }, [sortingOptions])

  const reloadLenses = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  return (
    <context.Provider value={{
      draggingNewBlock, setDraggingNewBlock,
      layoutRefs,
      lensId, setLensId,
      lensName, setLensName,
      reloadKey, reloadLenses, allLenses,
      activeComponent, setActiveComponent,
      pinnedLensesLoading, pinnedLenses, setPinnedLenses,
      accessType, setAccessType,
      sortingOptions, setSortingOptions,
      onboardingStep, onboardingIsComplete, goToNextOnboardingStep, completeOnboarding, resetOnboarding
    }}>
      {children}
    </context.Provider>
  );
};