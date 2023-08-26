import { NextResponse, NextRequest} from 'next/server'
import { createClient } from '@supabase/supabase-js';
import { getAnswerForQuestion } from './answerQuestionHelper';
import { headers } from 'next/headers';


export async function OPTIONS(request: NextRequest) {
    // Handle preflight requests
    return new NextResponse(
        JSON.stringify({}),
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    console.log("request was made");
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable is not defined');
    }
    //const headers = new Headers();
    //headers.set('Access-Control-Allow-Origin', process.env.BASE_URL);
    //headers.set('Access-Control-Allow-Methods', 'GET,POST');
    //headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    try {
        const { question } = await request.json();

        if (!question) {
            return new NextResponse(
                JSON.stringify({error: "Question is required" }),
                { status: 400 }
            );
        }
        const response = await getAnswerForQuestion(question);
        return new NextResponse(
            JSON.stringify({ answer_preview: response.answer_preview, answer_full: response.answer_full, slug: response.slug }),
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({error: 'Internal Server Error' }),
            { status: 500 }
        );
    }
}