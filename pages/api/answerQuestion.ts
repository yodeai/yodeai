import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { processVectorSearch } from './vectorSearch';

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!url) {
    throw new Error('SUPABASE_URL environment variable is not defined');
}
if (!supabaseKey) {
    throw new Error('supabasekey environment variable is not defined');
}

const client = createClient(url, supabaseKey);

export const getAnswerForQuestion = async (question: string, whatsappDetails?: { messageId: string, phoneNumber: string }) => {
    const result = await processVectorSearch(question);
    interface InsertData {
        question_text: string;
        generated_answer: string | null;
        asked_on_whatsapp: boolean;
        whatsapp_message_id?: string;
        whatsapp_phone_number?: string;
    }

    // Prepare data for insertion
    const insertData: InsertData = {
        question_text: result.question,
        generated_answer: result.response,
        asked_on_whatsapp: !!whatsappDetails
    };

    // If the message is from WhatsApp, add additional details
    if (whatsappDetails) {
        insertData['whatsapp_message_id'] = whatsappDetails.messageId;
        insertData['whatsapp_phone_number'] = whatsappDetails.phoneNumber;
    }

    // Log to the database
    const { data, error } = await client.from('questions').insert(insertData);

    if (error) {
        console.error("Error inserting into database:", error);
    }

    return result;
};



export default async (req: NextApiRequest, res: NextApiResponse) => {
    // Set the CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://yodeai.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method === 'POST') {
        try {
            const { question } = req.body;
            if (!question) {
                res.status(400).json({ error: "Question is required" });
                return;
            }

            const result = await getAnswerForQuestion(question);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
