import { Block } from "./block";
import { Lens } from "./lens";

export type Database = {
    block: {
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
    }[];
    lens: {
        lens_id: number;  
        name: string;
        created_at: Date;
        update_aAt: Date;
        children?: Lens[];  
        blocks?: Block[];  
    }[];
    users: {
        user_id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string;
    }
  };

