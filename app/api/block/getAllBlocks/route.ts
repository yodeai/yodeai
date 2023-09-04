import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerComponentClient({ cookies })
        const { data: blocks } = await supabase.from('block').select()
        return new NextResponse(
            JSON.stringify({ data: blocks }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving blocks:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed retrieve block.' }),
            { status: 500 }
        );
    }

}