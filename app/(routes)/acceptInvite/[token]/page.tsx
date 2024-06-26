"use client";
import { useProgressRouter } from "app/_hooks/useProgressRouter";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { useAppContext } from "@contexts/context";

export default function acceptInvite({ params }: { params: { token: string } }) {
  const router = useProgressRouter();
  const supabase = createClientComponentClient()
  const [intendedRecipient, setIntendedRecipient] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const { user } = useAppContext();

  const handleRefresh = () => {
    router.refresh();
  }

  useEffect(() => {
    const checkRecipient = async () => {
      const { data, error } = await supabase
        .from('lens_invites')
        .select()
        .eq('token', params.token);

      if (data.length == 0 || user["email"] !== data[0]["recipient"]) {
        router.push("/notFound");
      } else if (data[0]["status"] == "accepted") {
        setAccepted(true);
      } else {
        setIntendedRecipient(true);
      }
    }
    checkRecipient();
  }, []);

  const handleAcceptInvite = async () => {

    // TODO: move the logic of this function to the parent component
    // and re-use this page component just to show result.
    try {
      const { data: invites } = await supabase.from('lens_invites').select().eq('token', params.token);

      if (!invites || invites.length === 0) {
        console.error('No invite found with the provided token');
        // Handle the error accordingly
        return;
      }

      const rootLensId = invites[0].lens_id;
      const { data: existingUserData } = await supabase.from('lens_users').select().eq('user_id', user.id).eq('lens_id', rootLensId);

      const lensUserData = {
        "user_id": user.id,
        "lens_id": invites[0].lens_id,
        "access_type": invites[0].access_type,
      };

      if (existingUserData.length > 0) {
        // User already exists, update their access type
        await supabase.from('lens_users').update(lensUserData).eq("user_id", user.id).eq("lens_id", rootLensId);
      } else {
        // User doesn't exist, insert a new record
        await supabase.from('lens_users').insert(lensUserData);
      }
      const { data: parentData } = await supabase.from("lens").select("parent_id").eq("lens_id", rootLensId);
      await supabase.from('lens_users').update({ "subspace_only": parentData[0].parent_id != -1 ? true : false }).eq("lens_id", rootLensId);


      const { data: subspaces } = await supabase
        .from("lens")
        .select("lens_id")
        .contains('parents', [rootLensId]);

      for (const { lens_id } of subspaces) {
        const { data: existingUserData } = await supabase.from('lens_users').select().eq('user_id', user.id).eq('lens_id', lens_id);

        const lensUserData = {
          "user_id": user.id,
          "lens_id": lens_id,
          "access_type": invites[0].access_type,
          "subspace_only": false,
        };
        console.log("Share", lensUserData)

        if (existingUserData.length > 0) {
          // User already exists, update their access type
          await supabase.from('lens_users').update(lensUserData).eq("user_id", user.id).eq("lens_id", lens_id);
        } else {
          // User doesn't exist, insert a new record
          await supabase.from('lens_users').insert(lensUserData);
        }


      }
      // Update the invite status to 'accepted'
      await supabase.from('lens_invites').update({ "status": "accepted" }).eq('token', params.token);

      setAccepted(true);
      handleRefresh();
    } catch (error) {
      console.error('Error accepting invite:', error.message);
      // Handle the error accordingly
    }
  };

  return (
    <div>
      {intendedRecipient && !accepted ? (
        <main className="container">
          <div className="w-full flex flex-col p-8">
            <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
              Accept invite?
              <Button onClick={handleAcceptInvite} className="no-underline gap-2 font-semibold rounded px py-1 bg-white text-gray-400 border-0">
                Accept
              </Button>
            </div>
          </div>
        </main>
      ) : accepted ? (
        <main className="container">
          <div className="w-full flex flex-col p-8">
            <div className="flex items-start justify-between elevated-block p-8 rounded-md bg-white border border-gray-200 mb-4 mt-12">
              The invite has been accepted.
            </div>
          </div>
        </main>
      ) : null}
    </div>
  );

}
