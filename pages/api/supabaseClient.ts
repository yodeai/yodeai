import { createClient } from '@supabase/supabase-js';

const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is not defined');
}
if (!SUPABASE_ANON_KEY) {
    throw new Error('supabasekey environment variable is not defined');
}


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
