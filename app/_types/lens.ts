import { Block } from "./block";

export type Lens = {
    lens_id: number;  
    name: string;
    created_at: Date;
    updated_at: Date;
    children?: Lens[];  // Array of child Lens objects
    blocks?: Block[];   // Array of child Block objects
  }
  