
import { NextResponse, NextRequest } from 'next/server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const supabase = createServerComponentClient({ cookies });

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