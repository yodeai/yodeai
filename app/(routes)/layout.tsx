import Navbar from "@components/Navbar";
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { LensProvider } from "@contexts/context";
import { Flex } from "@mantine/core";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode; }) {
  // redirect if not logged in
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/landing");
  }

  return (
    <LensProvider>
      <div className="flex flex-col sm:flex-row h-screen">

        {/* Navbar with a right border and full height */}
        {/* <div style={{ borderRightWidth: 1, borderRightColor: '#eee' }} className="flex flex-col overflow-y-auto order-2 sm:order-1 sm:h-full">
          <Navbar />
        </div> */}

        <Flex mih={'100%'} align={"flex-start"} justify={"flex-start"} display={{ base: 'none', sm: 'block' }} direction={"column"} style={{ zIndex: 280, position: 'fixed', top: 50, padding: '10px', backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#eee' }}>
          <Navbar />
        </Flex>

        {/* Main content area */}
        <Flex w={'100%'} direction={{ base: 'column', sm: 'row' }}>
          <Flex style={{ flex: 4 }} ml={{ base: 0, sm: 230 }} mih={'100vh'} direction={"column"}>
            {children}
          </Flex>

          {/* QuestionAnswerForm with a left border */}
          <Flex align={"center"} justify={"center"} w={'20vw'} display={{ base: 'none', sm: 'block' }} style={{ borderLeftWidth: 1, borderLeftColor: '#eee' }}>
            <QuestionAnswerForm />
          </Flex>
        </Flex>

      </div>
    </LensProvider>
  );
}

