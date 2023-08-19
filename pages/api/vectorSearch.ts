import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { OpenAI as LCOpenAI } from "langchain/llms/openai";
import { OpenAI as OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { RetrievalQAChain } from 'langchain/chains';

const openai = new OpenAI();

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

export const processVectorSearch = async (question: string) => {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const embeddings = new OpenAIEmbeddings();
    if (!url) {
        throw new Error('SUPABASE_URL environment variable is not defined');
    }
    if (!supabaseKey) {
        throw new Error('supabasekey environment variable is not defined');
    }
    const client = createClient(url, supabaseKey);
    const model = new LCOpenAI({});  // add in the temperature parameter

    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: client,
        tableName: 'documents',
        queryName: 'match_documents',
    });

    const vectorStoreRetriever = vectorStore.asRetriever();
    const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);

    const getRelDocs = async (q: string) => {
        const docs = [];
        const ans1 = await vectorStoreRetriever.getRelevantDocuments(q);
        docs.push(...ans1);
        const ans2 = await vectorStore.similaritySearch(q, 8);
        docs.push(...ans2);
        return docs;
    };

    const dlist = await getRelDocs(question);
    let text = "";
    for (let d of dlist) {
        text += d.pageContent + "\n\n";
    }

    const prompt = "You are answering the questions of freshmen from UC Berkeley. Write a helpful and concise answer for the question:" + question + " in at most one paragraph from the following text: \n" + text;

    const response = await get_completion(prompt);
    return {
        question: question,
        response: response
    };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://yodeai.vercel.app');
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
