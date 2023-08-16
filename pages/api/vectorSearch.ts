// pages/api/vectorSearch.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI } from "langchain/llms/openai";
import { createClient } from '@supabase/supabase-js';
import { RetrievalQAChain } from 'langchain/chains';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const question = req.body.question;


    if(!question) {
        return res.status(400).json({ error: 'Question not provided' });
    }

    // Additional validations can be added as required.
    if (!supabaseKey || !url) {
        return res.status(400).json({ error: 'Missing environment variables' });
    }

    // Initialize OpenAIEmbeddings and create the Supabase client.
    const embeddings = new OpenAIEmbeddings();
    const client = createClient(url, supabaseKey);
    const model = new OpenAI({});

    // Initialize SupabaseVectorStore with the client, embeddings, table name, and query name.
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: client,
        tableName: 'documents',
        queryName: 'match_documents',
    });
    // For testing: 
    /*const vectorStore = await SupabaseVectorStore.fromTexts(
        ['Hello world', 'Bye bye', "What's this?"],
        [{ id: 2 }, { id: 1 }, { id: 3 }],
        new OpenAIEmbeddings(),
        {
            client,
            tableName: 'documents',
            queryName: 'match_documents',
        }
    );*/
    const vectorStoreRetriever = vectorStore.asRetriever();
    const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);

    const resultOne = await chain.call({
        query: question,
      });
    return res.status(200).json(resultOne);
}
