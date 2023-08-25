import ReactMarkdown from 'react-markdown';
import fetchData from '../../../utils/apiClient';
export const dynamic = 'force-dynamic'


export default async function Page({ params }: { params: { slug: string } })  {
    const url = '/api/question';
    const tparams = new URLSearchParams({ slug: params.slug }).toString(); 
    const API_ENDPOINT = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.API_BASE_URL || '';
    // Check if running on the server or the client
    const isServerSide = typeof window === 'undefined';
    const endpoint = `${url}?${tparams}`;
    // Adjust the endpoint based on the context (server side doesn't need the /api prefix)
    const adjustedEndpoint = isServerSide 
      ? (endpoint.startsWith('/api') ? endpoint.replace('/api', '') : endpoint) 
      : endpoint;


    const response = await fetchData(`${url}?${tparams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });/*
    const question = response.data;*/
    const question = {question_text: endpoint, answer_full: "*"+adjustedEndpoint+"*", slug: "hi"}

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
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">{question.question_text} </h1>
                        <ReactMarkdown className="text-lg mt-4 text-gray-600">{question.answer_full}</ReactMarkdown>
                    </div>
                </div>
            </div>

            
        </div>
    );
}


