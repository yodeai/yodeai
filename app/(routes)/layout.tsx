import Navbar from "@components/Navbar";
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { LensProvider } from "@contexts/context";
import { Flex, ScrollArea } from "@mantine/core";
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
      <div style={{ paddingTop: 50, flex: 1 }} className="flex flex-col sm:flex-row">

        <Flex mih={'100%'} align={"flex-start"} justify={"flex-start"} display={{ base: 'none', sm: 'block' }} direction={"column"} style={{ zIndex: 280, position: 'fixed', top: 50, backgroundColor: '#fff', marginTop: 10, borderRightWidth: 1, borderRightColor: '#eee' }}>
          <Navbar />
        </Flex>

        {/* Main content area */}
        <Flex mah={'100%'} w={'100%'} direction={{ base: 'column', sm: 'row' }}>
          <Flex h={'100%'} style={{ flex: 1 }} ml={{ base: 0, sm: 230 }} direction={"column"}>
            <ScrollArea type={"scroll"} mt={15.5} w={'100%'} h={'100vh'} scrollbarSize={8}>
              {children}
            </ScrollArea>
          </Flex>

          {/* QuestionAnswerForm with a left border */}
          <Flex mih={'100%'} align={"center"} justify={"center"} w={'25vw'} display={{ base: 'none', sm: 'block' }} style={{ position: 'relative', top: 50, right: 0 }}>
            <Flex mih={'100%'} align={"center"} justify={"center"} w={'25vw'} display={{ base: 'none', sm: 'block' }} style={{ position: 'fixed', top: 50, right: 0, borderLeftWidth: 1, borderLeftColor: '#eee' }}>
              <QuestionAnswerForm />
            </Flex>
          </Flex>
        </Flex>

      </div>
    </LensProvider>
  );
}

