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
        <div className="overflow-y-auto flex-shrink-0">
          <Navbar session={session.session} data={data} />
        </div>
        <div className="w-[50vw] overflow-y-auto">
          {children}
        </div>
        <div className="w-[30vw] bg-white border-l  overflow-y-auto ">
          <QuestionAnswerForm />
        </div>
      </div>
    </>
  );
}