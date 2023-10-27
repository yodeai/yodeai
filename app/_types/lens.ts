import { Block } from "./block";
type LensUsers = {
  access_type: string;
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
  }
  