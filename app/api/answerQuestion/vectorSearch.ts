import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { OpenAI as LCOpenAI } from "langchain/llms/openai";
import { OpenAI as OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { RetrievalQAChain } from 'langchain/chains';

const openai  = new OpenAI();

const get_completion = async (prompt: string) => {
    try {
        const model = "gpt-3.5-turbo";

        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("Error getting completion:", error);
        throw error;
    }
};

type Metadata = {
    title: string;
    source: string;
    language: string;
    page?: number;
  };
  
  function removeDuplicates(metadataList: Metadata[]): Metadata[] {
    const uniqueList: Metadata[] = [];
  
    metadataList.forEach(meta => {
      if (!uniqueList.some(item => 
          item.title === meta.title && 
          item.source === meta.source && 
          item.language === meta.language)) {
        uniqueList.push(meta);
      }
    });
  
    return uniqueList;
  }
  
  
export const processVectorSearch = async (question: string) => {
    console.log("processVectorSearch");
    //const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    //const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACEHUB_API_KEY, 
      });
    const documentRes = await embeddings.embedDocuments(["Hello world", "Bye bye"]);

    //if (!url) {
    //    throw new Error('SUPABASE_URL environment variable is not defined');
    //}
    //if (!supabaseKey) {
    //    throw new Error('supabasekey environment variable is not defined');
   // }
   /*
    const supabase = createServerComponentClient({ cookies });
    //const client = createClient(url, supabaseKey);
    const model = new LCOpenAI({});  // add in the temperature parameter
    console.log("create vector store");
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents',
    });

    const vectorStoreRetriever = vectorStore.asRetriever();
    const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
    console.log("get rel docs");
    const getRelDocs = async (q: string) => {
        const docs = [];
        const metadataList = [];
        console.log("getting relevant docs from vector store");
        const ans1 = await vectorStoreRetriever.getRelevantDocuments(q);
        console.log("received relevant docs from vector store");
        docs.push(...ans1);
        for (let doc of ans1) {
           console.log(doc.metadata);
           metadataList.push(doc.metadata);
        }
        console.log("getting relevant docs from second vector store");
        //const ans2 = await vectorStore.similaritySearch(q, 8);
        console.log("received relevant docs from vector store");
        
        //docs.push(...ans2);
        //for (let doc of ans2) {
        //    console.log(doc.metadata);
        //    metadataList.push(doc.metadata);
       // }
        return { documents: docs, metadata: metadataList };;*/
    };
    
    const results = await getRelDocs(question);
    console.log("get rel docs done");
    const dlist = results.documents;  // Get the documents
    const metadataList = results.metadata;  // Get the metadata
    let text = "";
    for (let d of dlist) {
        text += d.pageContent + "\n\n";
    }

    const prompt = "You are answering questions from freshmen at UC Berkeley. Answer the question: " + question + " in a helpful and concise way and in at most one paragraph, using the following text inside tripple quotes: '''" + text + "''' \n <<<REMEMBER:  If the question is irrelevant to the text, do not try to make up an answer, just say that the question is irrelevant to the context.>>>"
    console.log("###PROMPT:", prompt);
    const response = await get_completion(prompt);
    console.log("###RESPONSE:", response);
    const filteredMetadata = metadataList.filter(meta => 
        typeof meta.source === 'string' 
    );
    const uniqueMetadataList = removeDuplicates(filteredMetadata  as Metadata[]);
    console.log(uniqueMetadataList);
    //console.log(metadataList);
    console.log("##end");
    return {
        question: question,
        response: response,
        metadata: uniqueMetadataList  
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://cal-lens.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const question = req.body.question;

    if (!question) {
        return res.status(400).json({ error: 'Question not provided' });
    }

    try {
        const result = await processVectorSearch(question);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching completion:", error);
        return res.status(500).json({ error: 'Failed to process question.' });
    }
}
