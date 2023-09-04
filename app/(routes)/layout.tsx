import Navbar from "@components/Navbar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import QuestionAnswerForm from '../_components/QuestionAnswerForm'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const { data: session } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from('lens')
    .select('*')
    //.eq('user_id', session.user.id)

  if (error) {
    console.error("An error occurred:", error);
    return null;
  }

  return (
    <>
      <div className="flex">
        <Navbar session={session.session} data={data} />
        <div className="flex-grow min-w-[600px]">
          {children}
        </div>
        <div className=" bg-white border-l ">
          <QuestionAnswerForm /> 
        </div>
      </div>
    </>
  );
}