import Navbar from "@components/Navbar";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import QuestionAnswerForm from '@components/QuestionAnswerForm'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClientComponentClient();

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