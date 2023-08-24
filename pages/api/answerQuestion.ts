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


async function generateUniqueSlug(baseSlug: string): Promise<string> {
    let suffix = 1;
    let potentialSlug = baseSlug;

    while (true) {
        const { data, error } = await client
            .from('questions')
            .select('id')
            .eq('slug', potentialSlug)

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {  // Check if data is empty or not.
            return potentialSlug;
        }

        // If slug exists, append/increment the suffix and check again.
        suffix += 1;
        potentialSlug = `${baseSlug}-${suffix}`;
    }
}

function generateSlug(text: string, wordLimit = 10): string {
    const limitedText = text.split(' ').slice(0, wordLimit).join(' '); // Take the first n words.
    const slug = limitedText
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9\s]+/g, '') // Remove special characters and punctuations
        .trim() // Trim any leading or trailing spaces
        .replace(/\s+/g, '-'); // Replace spaces with hyphens

    return slug;
}


async function fetchLinksFromDatabase(): Promise<{ [title: string]: string }> {
    const { data, error } = await client.from('links').select('title, url');
    if (error) throw error;

    const linkMap: { [title: string]: string } = {};

    if (data) {
        data.forEach(link => {
            linkMap[link.title] = link.url;
        });
    }

    return linkMap;
}

function addHyperlinksToResponse(response: string, linkMap: { [title: string]: string }): string {
    const keyList = Object.keys(linkMap).sort((a, b) => b.length - a.length);

    let newResponse = response;
    let i = 0;
    while (i < newResponse.length) {
        for (const key of keyList) {
            if (newResponse.slice(i).startsWith(key)) {
                const href = `[${key}](${linkMap[key]})`;
                newResponse = `${newResponse.slice(0, i)}${href}${newResponse.slice(i + key.length)}`;
                i += href.length - 1;
                break;
            }
        }
        i += 1;
    }

    return newResponse;
}



export const getAnswerForQuestion = async (question: string, whatsappDetails?: { messageId: string, phoneNumber: string }) => {
    const result = await processVectorSearch(question);

    // Generate a unique slug for the question
    const baseSlug = generateSlug(result.question);
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    // Extract sources from the metadata
    const sources = result.metadata
        .map((meta, index) => {
            const isTempURL = meta.source === "/var/folders/1r/n3tszc0n3zjcxyjf1tby4ng80000gn/T/tmpumhyx40m";
            const title = isTempURL
                ? "Campus Policies and Guidelines Concerning the Academic Calendar, RRR Week, Exams, and Commencement"
                : meta.title;

            const sourceURL = isTempURL
                ? "https://registrar.berkeley.edu/wp-content/uploads/2021/03/050714_Campus-Policies-and-Guidelines-Concerning-the-Academic-Calendar.pdf"
                : meta.source;

            return `${index + 1}. [${title}](${sourceURL})`;
        })
        .join("\n");

    const linkMap = await fetchLinksFromDatabase();

    // Append the sources to the response to create the full answer
    //let fullAnswer = `${result.response}\n\n\nSources:\n${sources}`;
    let fullAnswer: string;

    if (result.response) {
        fullAnswer = addHyperlinksToResponse(result.response, linkMap);
    } else {
        fullAnswer = "";  
    }

    // Append the sources to the response to create the full answer
    const fullAnswer_with_sources = `${fullAnswer}\n\n\nSources:\n${sources}`;


    interface InsertData {
        question_text: string;
        answer_preview: string | null;
        answer_full: string | null;
        slug: string;
        asked_on_whatsapp: boolean;
        whatsapp_message_id?: string;
        whatsapp_phone_number?: string;
    }

    // Prepare data for insertion
    const insertData: InsertData = {
        question_text: result.question,
        answer_preview: result.response,
        answer_full: fullAnswer_with_sources,
        slug: uniqueSlug,
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


    console.log("HERE WE GO:");
    console.log(insertData.answer_preview);
    console.log("full: ");
    console.log(insertData.answer_full);
    // Return answer_preview, answer_full, and slug
    return {
        answer_preview: insertData.answer_preview,
        answer_full: insertData.answer_full,
        slug: uniqueSlug
    };
};


export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable is not defined');
    }
    // Set the CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.BASE_URL);
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

            const response = await getAnswerForQuestion(question);
            res.status(200).json({ answer_preview: response.answer_preview, answer_full: response.answer_full, slug: response.slug });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};
