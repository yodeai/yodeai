"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel, RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { Lens } from 'app/_types/lens';
import { getSortingOptionsFromLocalStorage, getZoomLevelFromLocalStorage, setSortingOptionsToLocalStorage, setZoomLevelToLocalStorage } from '@utils/localStorage';
import { User } from '@supabase/auth-helpers-nextjs';
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from 'next/navigation';

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
  activeComponent: "global" | "lens" | "myblocks" | "inbox";
  setActiveComponent: React.Dispatch<React.SetStateAction<string>>;

  breadcrumbActivePage?: {
    title: string;
    href: string;
  }
  setBreadcrumbActivePage: React.Dispatch<React.SetStateAction<contextType["breadcrumbActivePage"]>>;

  pinnedLensesLoading: boolean;
  pinnedLenses: Lens[];
  setPinnedLenses: React.Dispatch<React.SetStateAction<Lens[]>>;
  accessType: "owner" | "editor" | "reader",
  setAccessType: React.Dispatch<React.SetStateAction<string>>;

  layoutRefs: {
    main: React.RefObject<HTMLDivElement>;
    sidebar: React.RefObject<HTMLDivElement>;
    navbar: React.RefObject<HTMLDivElement>;
  },

  draggingNewBlock: boolean;
  setDraggingNewBlock: React.Dispatch<React.SetStateAction<boolean>>;

  subspaceModalDisclosure: ReturnType<typeof useDisclosure>;
  whiteboardModelDisclosure: ReturnType<typeof useDisclosure>;
  userInsightsDisclosure: ReturnType<typeof useDisclosure>;
  competitiveAnalysisDisclosure: ReturnType<typeof useDisclosure>;
  spreadsheetModalDisclosure: ReturnType<typeof useDisclosure>;
  painPointTrackerModalDisclosure: ReturnType<typeof useDisclosure>;
  iconItemDisclosure: ReturnType<typeof useDisclosure>;
  widgetFormDisclosure: ReturnType<typeof useDisclosure>;

  navbarDisclosure: ReturnType<typeof useDisclosure>;
  toolbarDisclosure: ReturnType<typeof useDisclosure>;

  sortingOptions: {
    order: "asc" | "desc",
    sortBy: null | "name" | "createdAt" | "updatedAt" | "type"
  },
  setSortingOptions: React.Dispatch<React.SetStateAction<contextType["sortingOptions"]>>;

  user?: User;

  zoomLevel: number;
  setZoomLevel: (zoomLevel: number, lensIdOrTitle: string) => void;
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
  breadcrumbActivePage: undefined,
  setBreadcrumbActivePage: () => { },

  pinnedLensesLoading: true,
  pinnedLenses: [],
  setPinnedLenses: () => { },
  accessType: "owner",
  setAccessType: () => { },

  layoutRefs: {
    main: React.createRef<HTMLDivElement>(),
    sidebar: React.createRef<HTMLDivElement>(),
    navbar: React.createRef<HTMLDivElement>()
  },

  draggingNewBlock: false,
  setDraggingNewBlock: () => { },

  subspaceModalDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  whiteboardModelDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  userInsightsDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  competitiveAnalysisDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  spreadsheetModalDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  painPointTrackerModalDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  iconItemDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  widgetFormDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],

  navbarDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],
  toolbarDisclosure: [false, { open: () => { }, close: () => { }, toggle: () => { } }],

  sortingOptions: getSortingOptionsFromLocalStorage() ?? {
    order: "asc",
    sortBy: null
  },
  setSortingOptions: () => { },
  user: undefined,

  zoomLevel: 100,
  setZoomLevel: () => { },

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
  initialState?: {
    user: contextType["user"];
  }
};

export const useAppContext = () => {
  return useContext(context);
};

export const LensProvider: React.FC<LensProviderProps> = ({ children, initialState }) => {
  const pathname = usePathname();
  const supabase = createClientComponentClient()
  const [lensId, setLensId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [lensName, setLensName] = useState<string | null>(null);
  // allLenses is a list of the lenses that this user has, is used to suggest lenses
  const [allLenses, setAllLenses] = useState<{ lens_id: number, name: string, access_type: string; pinned: true }[]>([]);
  const [pinnedLensesLoading, setPinnedLensesLoading] = useState(true);
  const [pinnedLenses, setPinnedLenses] = useState<Lens[]>([]);
  const [activeComponent, setActiveComponent] = useState<contextType["activeComponent"]>("global");
  const [accessType, setAccessType] = useState<contextType["accessType"]>(null);
  const [draggingNewBlock, setDraggingNewBlock] = useState(false);
  const [sortingOptions, setSortingOptions] = useState<contextType["sortingOptions"]>(defaultValue.sortingOptions);
  const [user, setUser] = useState<User>(initialState?.user || null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [breadcrumbActivePage, setBreadcrumbActivePage] = useState<contextType["breadcrumbActivePage"]>(undefined);

  const subspaceModalDisclosure = useDisclosure(false);
  const whiteboardModelDisclosure = useDisclosure(false);
  const userInsightsDisclosure = useDisclosure(false);
  const competitiveAnalysisDisclosure = useDisclosure(false);
  const spreadsheetModalDisclosure = useDisclosure(false);
  const painPointTrackerModalDisclosure = useDisclosure(false);
  const iconItemDisclosure = useDisclosure(false);
  const widgetFormDisclosure = useDisclosure(false);

  const navbarDisclosure = useDisclosure(false);
  const toolbarDisclosure = useDisclosure(false);

  // Onboarding Context Data
  const [onboardingStep, setOnboardingStep] = useState(-1);
  const [onboardingIsComplete, setOnboardingIsComplete] = useState(false);

  const goToNextOnboardingStep = () => {
    setOnboardingStep((currentStep) => currentStep + 1);
    console.log("going to next step");
  };

  const resetOnboarding = () => {
    setOnboardingStep(0);
    console.log("resetting onboarding step");
  };

  const completeOnboarding = async () => {
    const { error } = await supabase
      .from('onboarding_list')
      .delete()
      .match({ uid: user.id });

    setOnboardingStep(-1);
    setOnboardingIsComplete(true);

    if (error) {
      console.error('Failed to update onboarding status:', error.message);
    } else {
      console.log("onboarding complete");
    }
  };

  useEffect(() => {
    if (onboardingIsComplete) {
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('onboarding_list')
          .select('*')
          .eq('uid', user.id)
          .single();

        if (error) {
          setOnboardingStep(-1);
          setOnboardingIsComplete(true);
          throw error;
        }

        if (data) {
          if (onboardingStep === -1) {
            setOnboardingStep(0);
            setOnboardingIsComplete(false);
          }
        } else {
          setOnboardingStep(-1);
          setOnboardingIsComplete(true);
        }

      } catch (error) {
        console.error('Failed to check onboarding status:', error.message);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const layoutRefs = {
    sidebar: React.createRef<HTMLDivElement>(),
    main: React.createRef<HTMLDivElement>(),
    navbar: React.createRef<HTMLDivElement>()
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

  const getUser = async () => {
    supabase.auth.getUser().then((user) => {
      if (!user?.data?.user) return;
      setUser(user.data.user);
    })
  }

  useEffect(() => {
    // Get the lensId from the URL
    const parts = pathname.split('/');

    if (pathname === '/') {
      setActiveComponent("global");
    }

    if (pathname === '/inbox') {
      setActiveComponent("inbox");
    }
    if (pathname === '/myblocks') {
      setActiveComponent("myblocks");
    }

    else if (parts[1] === 'lens') {
      console.log("setting app context to be ", parts[parts.length - 1])
      setLensId(parts[parts.length - 1]);  // Set the lensId based on the URL
      setActiveComponent("lens");
    }

    // Get all the lenses that this user has
  }, [pathname]);

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
  }, [lensId]);

  useEffect(() => {
    getAllLenses();
    getPinnedLenses();
    getUser();
  }, [])

  useEffect(() => {
    setSortingOptionsToLocalStorage(sortingOptions);
  }, [sortingOptions])

  const reloadLenses = () => {
    setReloadKey(prevKey => prevKey + 1);
  };

  const setIconViewZoomLevel = (zoomLevel: number, lensIdOrTitle: string = "default") => {
    setZoomLevel(zoomLevel);
    setZoomLevelToLocalStorage(lensIdOrTitle, zoomLevel);
  }

  const memoizedZoomLevel = useMemo(() => {
    return getZoomLevelFromLocalStorage(lensId || "default") || 100;
  }, [zoomLevel, lensId]);

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
      subspaceModalDisclosure, whiteboardModelDisclosure,
      userInsightsDisclosure, competitiveAnalysisDisclosure,
      spreadsheetModalDisclosure, iconItemDisclosure,
      painPointTrackerModalDisclosure,
      widgetFormDisclosure,
      navbarDisclosure, toolbarDisclosure,
      sortingOptions, setSortingOptions,
      user,
      zoomLevel: memoizedZoomLevel,
      setZoomLevel: setIconViewZoomLevel,
      breadcrumbActivePage, setBreadcrumbActivePage,
      onboardingStep, onboardingIsComplete, goToNextOnboardingStep, completeOnboarding, resetOnboarding
    }}>
      {children}
    </context.Provider>
  );
};