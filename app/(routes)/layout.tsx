import Navbar from "@components/Layout/Navbar";
import Toolbar from '@components/Layout/Toolbar'
import { LensProvider } from "@contexts/context";
import ExplorerProvider from "@contexts/explorer";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NextTopLoader from 'nextjs-toploader';
import { Breadcrumb } from "@components/Layout/Breadcrumb";
import { Main } from "@components/Layout/Main";

export default async function AppLayout({ children }: { children: React.ReactNode; }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/landing");
  }

  return (
    <>
      <NextTopLoader />
      <ExplorerProvider>
        <Navbar /> {/* Mantine.Navbar */}
        <Main>
          {children} {/* Mantine.Main */}
        </Main>
        <Toolbar /> {/* Mantine.Aside */}
        <Breadcrumb /> {/* Mantine.Footer */}
      </ExplorerProvider>
    </>
  );
}
