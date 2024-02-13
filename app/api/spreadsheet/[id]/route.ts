import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { removeNullValues } from '@lib/object';
import { Database } from 'app/_types/supabase'
import apiClient from '@utils/apiClient';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');
    if (Number.isNaN(Number(params.id))) return notOk('Invalid ID');

    try {
        const { name = null, dataSource = null, plugin = null } = await request.json();
        const requestPayload = removeNullValues({ name, dataSource, plugin });

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


        const {data, error: selectError} = await supabase.from('spreadsheet').select('task_id').eq('spreadsheet_id', spreadsheet_id);
        const task_id = data[0]['task_id']
        const { error } = await supabase
            .from('spreadsheet')
            .delete()
            .eq('spreadsheet_id', spreadsheet_id);

    
        // revoke celery task if still running
        if (task_id) {
          await apiClient('/revokeTask', 'POST', {"task_id": task_id})
            .then(result => {
              console.log('revoked task successfully', result);
            })
            .catch(error => {
              console.log('error revoking task: ' + error.message);
            });
        }
    
        if (error) {
          throw error;
        }
        return ok({ spreadsheet_id });
    } catch (err) {
        return notOk(`${err}`);
    }
}