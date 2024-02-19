import Navbar from "@components/Navbar";
import { MobileNavbar } from "@components/MobileNavbar";
import Toolbar from '@components/Toolbar'
import { LensProvider } from "@contexts/context";
import ExplorerProvider from "@contexts/explorer";
import { Flex, Box } from "@mantine/core";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NextTopLoader from 'nextjs-toploader';

export default async function AppLayout({ children }: { children: React.ReactNode; }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/landing");
  }

  return (
    <>
      <NextTopLoader />
      <LensProvider>
        <ExplorerProvider>
          <div style={{ flex: 1 }} className="flex flex-col sm:flex-row">
            {/* Left Side bar */}
            <Flex component="nav" className="flex flex-col h-full bg-white border-r border-r-[#eeeeee] top-0 sticky"
              display={{ base: 'none', sm: 'flex' }}>
              <Navbar />
            </Flex>
            {/* Main content area */}
            <Flex mah='100%' w={'100%'} direction={{ base: 'row' }} className="overflow-x-hidden">
              <Flex mih={'100%'} align={"flex-start"} justify={"flex-start"} display={{ base: 'block', sm: 'none' }} direction={"column"} style={{ backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#eee' }}>
                <MobileNavbar />
              </Flex>
              <Box className="w-full h-[calc(100vh-60px)] overflow-scroll p-0 m-01">
                {children}
              </Box>

              {/* QuestionAnswerForm with a left border */}
              <Box h="100%" className="z-50">
                <Toolbar />
              </Box>
            </Flex>
          </div >
        </ExplorerProvider>
      </LensProvider>
    </>
  );
}
