import { Layouts } from "react-grid-layout";
import { Block } from "./block";
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
  shared: boolean;
  lens_users: LensUsers[]
  public: boolean;
  user_to_access_type: UserToAccessType
  parent_id: number;
}


export type LensLayout = {
  block_layout?: JSON | undefined;
  list_layout?: JSON | undefined;
  icon_layout?: Layouts | undefined;
}