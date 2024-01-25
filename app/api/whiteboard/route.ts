import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers';
import { notOk, ok } from '@lib/ok';
import { Database, Tables } from 'app/_types/supabase';
import { WhiteboardPluginParams } from 'app/_types/whiteboard';

export const dynamic = 'force-dynamic';

const waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));

const imitateWhiteboardProgress = async (data: Tables<"whiteboard">) => {
    const supabase = createServerComponentClient<Database>({ cookies });

    // status: queued
    await supabase.from('whiteboard').update({
        plugin: {
            ...data.plugin as WhiteboardPluginParams,
            state: { status: "queued" }
        } as WhiteboardPluginParams
    }).match({ whiteboard_id: data.whiteboard_id });

    // console.log("Whiteboard plugin queued.");

    await waitFor(500);

    // status: processing
    for (let i = 0; i < 10; i++) {
        await supabase.from('whiteboard').update({
            plugin: {
                ...data.plugin as WhiteboardPluginParams,
                state: {
                    status: "processing",
                    progress: i * 10
                }
            } as WhiteboardPluginParams
        }).match({ whiteboard_id: data.whiteboard_id });

        // console.log("Whiteboard plugin processing.", i);

        await waitFor(100);
    }

    // status: success
    await supabase.from('whiteboard').update({
        plugin: {
            ...data.plugin as WhiteboardPluginParams,
            state: {
                status: "success"
            }
        } as WhiteboardPluginParams
    }).match({ whiteboard_id: data.whiteboard_id });

    // console.log("Whiteboard plugin success.");
}

export async function POST(request: NextRequest) {
    const supabase = createServerComponentClient<Database>({ cookies });
    const user = await supabase.auth.getUser();

    if (!user.data.user.id) return notOk('User not found');

    try {
        const { name, lens_id, payload, plugin } = await request.json();
        if (!name) return notOk('Name is required');
        if (!payload) return notOk('Payload is required');

        const { data, error } = await supabase
            .from('whiteboard')
            .insert([
                {
                    name: name,
                    lens_id: lens_id,
                    owner_id: user.data.user.id,
                    plugin,
                    nodes: payload
                }
            ]).select();

        if (error) {
            console.log("error", error.message)
            throw error;
        }

        if (data.length && plugin) {
            imitateWhiteboardProgress(data[0]);
        }

        return ok(data);

    } catch (error) {
        return notOk("Error inserting lens");
    }
}