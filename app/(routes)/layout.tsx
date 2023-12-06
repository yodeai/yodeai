import Navbar from "@components/Navbar";
import QuestionAnswerForm from '@components/QuestionAnswerForm'
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
        <Flex component="nav" className="flex flex-col h-full bg-white border-r border-r-[#eeeeee]" display={{ base: 'none', sm: 'block' }} >
          <Navbar />
        </Flex>

        {/* Main content area */}
        <Flex mah='100%' w={'100%'} direction={{ base: 'column', sm: 'row' }}>
          <Box h='100%' style={{ flex: 1 }}>
            {children}
          </Box>

          {/* QuestionAnswerForm with a left border */}
          <Box h='100%' display={{ base: 'none', sm: 'block' }} w={{
            base: '0px',
            sm: '25vw'
          }}>
            <QuestionAnswerForm />
          </Box>
        </Flex>

      </div>
    </LensProvider>
  );
}

