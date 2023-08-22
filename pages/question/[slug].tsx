import { useRouter } from 'next/router'
import { fetchQuestionBySlug } from '../api/questions'; 
import ReactMarkdown from 'react-markdown';

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
    <div>
      <h1>{question.question_text}</h1>
      <ReactMarkdown className="text-lg mt-4">{question.answer_full}</ReactMarkdown>
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
