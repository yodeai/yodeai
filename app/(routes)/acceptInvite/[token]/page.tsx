"use client";
import { useRouter } from "next/navigation";
import { Button } from 'flowbite-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from "react";

export default function acceptInvite({ params }: { params: { token: string } }) {
    const router = useRouter();
    const supabase = createClientComponentClient()
    useEffect(() => {
        const checkRecipient = async() => {
            const { data: { user } } = await supabase.auth.getUser()
            let {data} = await supabase.from('lens_invites').select();
        
            if (user["email"] !== data[0]["recipient"]) {
                router.push("/notFound");
            }
        } 
        checkRecipient();
      }, []);
    const handleAcceptInvite = async () => {
        let { error } = await supabase
        .from('lens_invites')
        .update({ "status": "accepted" })
        .eq('token', params.token);

        if (error) {
            console.log('Error in updating invite status' + error);
            throw error;
        } 
        const { data: { user } } = await supabase.auth.getUser()
        let {data} = await supabase.from('lens_invites').select().eq('token', params.token);

        console.log("insertion", data, {"user_id": user["id"], "lens_id": data[0]["lens_id"], "access_type": data[0]["access_type"]})
        let addLens = await supabase.from('lens_users').insert({"user_id": user["id"], "lens_id": data[0]["lens_id"], "access_type": data[0]["access_type"]})
        if (addLens.error) {
            console.error('Error in inserting into the lens_users table', addLens.error.message);
            throw addLens.error;
        } else {
            router.push("/")
        } 
    };
    return (
        <main className="container">
        <div className="w-full flex flex-col p-8">
            <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
                Accept invite?
                
                <Button onClick={() => handleAcceptInvite()} className="no-underline gap-2 font-semibold rounded px py-1 bg-white text-gray-400 border-0">
                    Accept
                </Button>
            </div>
        </div>
        </main>

    );
}
