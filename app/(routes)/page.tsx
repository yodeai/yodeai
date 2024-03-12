import { SupabaseClient, createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from "app/_types/supabase";
import Home from '@components/Pages/Home';
import { cookies } from 'next/headers';

const supabase = createServerComponentClient<Database>({cookies})

const getHomeData = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lenses, error: lensesError } = await supabase
    .rpc('get_navbar_lenses', { "user_id_param": user.id })
    .select('*')
    .order('updated_at', { ascending: false });

  if (lensesError) {
    console.error('Error fetching lenses:', lensesError);
    throw lensesError;
  }


  for (const lens of lenses) {
    lens.user_to_access_type = {};
    lens.user_to_access_type[user.id] = lens.access_type;
  }

  return {
    lenses
  }
}

type HomePageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HomePage(props: HomePageProps) {
  const data = await getHomeData(supabase);

  return <Home lenses={data.lenses} layoutData={{}} />
}