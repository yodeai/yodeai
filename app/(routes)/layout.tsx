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
  console.log("session: ", session);
  if (!session) {
    redirect("/landing");
  }

  return (
    <LensProvider>
      <div className="flex flex-col sm:flex-row">
        <div className="overflow-y-auto order-2 sm:order-1 sm:max-h-[90vh]">
          <Navbar />
        </div>
        <div className="w-full overflow-y-auto order-3 sm:order-2 sm:w-[50vw] sm:max-h-[90vh]">
          {children}
        </div>
        <div className="w-full bg-white border-l overflow-y-auto order-1 sm:order-3 sm:w-[30vw] sm:max-h-[90vh]">
          <QuestionAnswerForm />
        </div>
      </div>
    </LensProvider>
  );
}

