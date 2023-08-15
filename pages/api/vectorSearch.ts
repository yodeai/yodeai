// pages/api/vectorSearch.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Additional validations can be added as required.
    if (!supabaseKey || !url) {
        return res.status(400).json({ error: 'Missing environment variables' });
    }

    // Initialize OpenAIEmbeddings and create the Supabase client.
    const embeddings = new OpenAIEmbeddings();
    const client = createClient(url, supabaseKey);

    // Initialize SupabaseVectorStore with the client, embeddings, table name, and query name.
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: client,
        tableName: 'documents',
        queryName: 'match_documents',
    });

    const resultOne = await vectorStore.similaritySearch('what is up?', 2);

    return res.status(200).json(resultOne);
}
