import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { removeNullValues } from '@lib/object';
import { Database } from 'app/_types/supabase'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');
    if (Number.isNaN(Number(params.id))) return notOk('Invalid ID');

    try {
        const { name = null, columns = null, dataSource = null, plugin = null } = await request.json();
        const requestPayload = removeNullValues({ name, columns, dataSource, plugin });

        const { data, error } = await supabase
            .from('spreadsheet')
            .update(requestPayload)
            .match({ spreadsheet_id: params.id });

        if (error) {
            console.log("error", error.message)
            throw error;
        }

        return ok(data);

    } catch (error) {
        return notOk("Error inserting spreadsheet", error.message);
    }
}

export async function DELETE(request: NextRequest, { params, }: { params: { id: string }; }) {
    const supabase = createServerComponentClient({ cookies });
    const spreadsheet_id = Number(params.id);

    // Validate the id
    if (isNaN(spreadsheet_id)) {
        return notOk("Invalid ID");
    }

    try {
        const { error } = await supabase
            .from('spreadsheet')
            .delete()
            .eq('spreadsheet_id', spreadsheet_id);

        if (error) {
            throw error;
        }

        return ok({ spreadsheet_id });
    } catch (err) {
        return notOk(`${err}`);
    }
}