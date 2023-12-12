import Navbar from "@components/Navbar";
import Toolbar from '@components/Toolbar'
import { LensProvider } from "@contexts/context";
import { Flex, Box } from "@mantine/core";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode; }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/landing");
  }

  return (
    <LensProvider>
      <div style={{ flex: 1 }} className="flex flex-col sm:flex-row">
        {/* Left Side bar */}
        <Flex component="nav" className="flex flex-col max-h-[calc(100vh-60px)] bg-white border-r border-r-[#eeeeee] top-0 sticky"
          display={{ base: 'none', sm: 'flex' }}>
          <Navbar />
        </Flex>

        {/* Main content area */}
        <Flex mah='100%' w={'100%'} direction={{ base: 'column', sm: 'row' }}>
          <Box h='100%' className="flex-1">
            {children}
          </Box>

          {/* QuestionAnswerForm with a left border */}
          <Box h='100%' display={{ base: 'none', sm: 'flex' }} className="flex-3">
            <Toolbar />
          </Box>
        </Flex>

      </div>
    </LensProvider>
  );
}

