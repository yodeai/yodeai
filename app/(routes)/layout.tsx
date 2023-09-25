
import Navbar from "@components/Navbar";
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { LensProvider } from "@contexts/lensContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
    <LensProvider>
      <div className="flex">
        <div className="overflow-y-auto max-h-[90vh]">
          <Navbar />
        </div>
        <div className="w-[50vw] overflow-y-auto max-h-[90vh] ">
          {children}
        </div>
        <div className="w-[30vw] bg-white border-l  overflow-y-auto max-h-[90vh]">
          <QuestionAnswerForm />
        </div>
      </div>
      </LensProvider>
    </>
    
  );
}


