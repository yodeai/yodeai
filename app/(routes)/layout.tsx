import Navbar from "@components/Navbar";
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { LensProvider } from "@contexts/context";
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
        <div className="flex flex-col overflow-y-auto order-2 sm:order-1 sm:border-r sm:h-full">
          <Navbar />
        </div>

        {/* Main content area */}
        <div className="flex-grow overflow-y-auto order-3 sm:order-2 sm:w-[50vw]">
          {children}
        </div>

        {/* QuestionAnswerForm with a left border */}
        <div className="w-full bg-white overflow-y-auto order-1 sm:order-3 sm:w-[30vw] sm:border-l sm:h-full">
          <QuestionAnswerForm />
        </div>

      </div>
    </LensProvider>
  );
}

