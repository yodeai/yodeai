import { processVectorSearch } from './vectorSearch';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';




async function fetchLinksFromDatabase(): Promise<{ [title: string]: string }> {
    const supabase = createServerComponentClient({ cookies });
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
    const lensID = 6;
    const result = await processVectorSearch(question);
    const supabase = createServerComponentClient({ cookies });
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
        asked_on_whatsapp: boolean;
        whatsapp_message_id?: string;
        whatsapp_phone_number?: string;
    }
    // Prepare data for insertion
    const insertData: InsertData = {
        question_text: result.question,
        answer_preview: result.response,
        answer_full: fullAnswer_with_sources,
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
    // Return answer_preview, answer_full
    return {
        answer_preview: insertData.answer_preview,
        answer_full: insertData.answer_full,
    };
};