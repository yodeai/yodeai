import { processVectorSearch } from './vectorSearch';
import { supabase } from "../supabaseClient";

async function generateUniqueSlug(baseSlug: string): Promise<string> {
    let suffix = 1;
    let potentialSlug = baseSlug;

    while (true) {
        const { data, error } = await supabase
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
    const { data, error } = await supabase.from('links').select('title, url');
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
    const { data, error } = await supabase.from('questions').insert(insertData);
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