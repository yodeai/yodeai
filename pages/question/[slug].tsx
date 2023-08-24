import { useRouter } from 'next/router'
import { fetchQuestionBySlug } from '../api/questions'; 
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic'

type Question = {
  id: string,
  question_text: string,
  answer_full: string,
  asked_on_whatsapp: boolean,
  whatsapp_message_id: string | null,
  whatsapp_phone_number: string | null,
  slug: string
};

type QuestionProps = {
  question: Question
};

const QuestionPage: React.FC<QuestionProps> = ({ question }) => {
  
  return (
    
    <div className="w-full flex flex-col ">
      <nav className="w-full flex  border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between  p-3 text-sm text-foreground">
          <div />
          <div>
            <a href="https://cal-lens.vercel.app/">Ask another question</a>
          </div>
        </div>
      </nav>


      <div className="animate-in flex flex-col gap-14 max-w-4xl px-3 py-16 lg:py-24 text-foreground">
        <div className="flex flex-col mb-4 lg:mb-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.question_text}</h1>
            <ReactMarkdown className="text-lg mt-4 text-gray-600">{question.answer_full}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}



export async function getServerSideProps(context: any) {
  const slug = context.params.slug;  
  const question = await fetchQuestionBySlug(slug); 

  if (!question) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      question
    }
  }
}

export default QuestionPage;
