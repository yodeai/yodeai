import { Layouts } from "react-grid-layout";
import { Block } from "./block";
import { Tables } from "./supabase";

type LensUsers = {
  access_type: string;
}
type UserToAccessType = {
  [key: string]: string;
}
export type Lens = {
  lens_id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  children?: Lens[];  // Array of child Lens objects
  blocks?: Block[];   // Array of child Block objects
  parents?: number[];
  shared: boolean;
  lens_users: LensUsers[]
  public: boolean;
  user_to_access_type: UserToAccessType
  parent_id: number;
  access_type: string;
  item_icons: ItemIcons;
}

export type LensLayout = {
  block_layout?: JSON | undefined;
  list_layout?: JSON | undefined;
  icon_layout?: Layouts | undefined;
}

export type Subspace = {
  lens_id: number
  name: string
  created_at: string
  updated_at: string
  parent_id: number
  owner_id: string
  shared: boolean
  public: boolean
  root: number
  parents: number[]
  access_type: string;
}

export type Whiteboard = {
  whiteboard_id: number;
  lens_id: number;
  name: string;
  data: JSON;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type ItemIcons = {
  [key: string]: string;
}

export type LensData = Lens & {
  lens_users: { user_id: string, access_type: string }[],
  user_to_access_type: { [key: string]: string }
  blocks: Block[],
  subspaces: Subspace[],
  spreadsheets: Tables<"spreadsheet">[],
  whiteboards: Tables<"whiteboard">[],
  widgets: Tables<"widget">[],
  layout: LensLayout
}