import supabase from '@utils/supabaseServerClient';
import { NextResponse, NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get("slug");
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return new NextResponse(
            JSON.stringify({ data: data }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving question:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed retrieve question.' }),
            { status: 500 }
        );
    }

}