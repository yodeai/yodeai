export type LensDetail = {
  lens_id: number;
  name: string;
};


export type Block = {
    block_id: number;  
    created_at: Date;
    updated_at: Date;
    block_type: string;
    title: string;
    content: string;
    parentId?: string;  
    parent?: Block;
    kids: Block[];
    links: Block[];
    backlinks: Block[];
    inLenses?: LensDetail[]; 
  }
  