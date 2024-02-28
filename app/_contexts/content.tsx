"use client";

import React, { createContext, useContext, ReactNode } from 'react';
'next/navigation';
import { Block } from 'app/_types/block';
import { Tables } from 'app/_types/supabase';
import { Lens, Subspace } from 'app/_types/lens';

export type contextType = {
  blocks: Block[];
  subspaces: Subspace[];
  whiteboards: Tables<"whiteboard">[];
  spreadsheets: Tables<"spreadsheet">[];
};


const defaultValue: contextType = {
  blocks: [],
  subspaces: [],
  whiteboards: [],
  spreadsheets: [],

};

const context = createContext<contextType>(defaultValue);

type LensContentProviderProps = {
  children: ReactNode;
  blocks: Block[];
  subspaces: Subspace[];
  whiteboards: Tables<"whiteboard">[];
  spreadsheets: Tables<"spreadsheet">[];
};

export const useContentContext = () => {
  return useContext(context);
};

export const ContentProvider: React.FC<LensContentProviderProps> = ({ children, ...props  }) => {

  return (
    <context.Provider value={props}>
      {children}
    </context.Provider>
  );
};