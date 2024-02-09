import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lens_id: string }; }) {
    try {
        const supabase = createServerComponentClient({ cookies });

        const { data: subspaces, error } = await supabase
            .from('spreadsheet')
            .select('spreadsheet_id, created_at, owner_id, lens_id, name')
            .eq('lens_id', params.lens_id);

        if (error) {
            console.log(error);
            throw error;
        }

        return new NextResponse(
            JSON.stringify({ data: subspaces }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error retrieving lens's spreadsheets:", error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to retrieve spreadsheets for lens.' }),
            { status: 500 }
        );
    }
}
