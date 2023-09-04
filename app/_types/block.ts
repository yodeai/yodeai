export type Block = {
    block_id: number;  
    created_at: Date;
    updated_at: Date;
    block_type: string;
    content: string;
    parentId?: string;  
    parent?: Block;
    kids: Block[];
    links: Block[];
    backlinks: Block[];
  }
  