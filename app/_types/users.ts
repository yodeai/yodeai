import { Lens } from './lens';

export type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    sharedLenses: Lens[]; // shared lenses have access_type: 'read' | 'write' | 'owner';
};
