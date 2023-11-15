import { UUID } from "crypto";
export type LensDetail = {
  lens_id: number;
  name: string;
  access_type: string;
};

export type LensBlock = {
  lens_id: number;
  block_id: number;
}

export type LensInvite = {
  sender: string;
  recipient: string;
  token: string;
  lens_id: number;
  updated_at: string;
  status: string;
  created_at: string;
  access_type: string;
}


export type Block = {
  block_id: number;
  created_at: Date;
  updated_at: Date;
  block_type: string;
  title: string;
  content: string;
  status: string;
  parentId?: string;
  parent?: Block;
  kids: Block[];
  links: Block[];
  backlinks: Block[];
  inLenses?: LensDetail[];
  file_url?: string;
  preview: string;
  lens_blocks: LensBlock;
  accessLevel?: string;
}
