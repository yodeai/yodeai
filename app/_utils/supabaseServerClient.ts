import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

const supabase = createServerComponentClient({ cookies });
export default supabase;