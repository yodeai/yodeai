import React from "react";
import formatDate from "@lib/format-date";
import clsx from "clsx";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Block, LensInvite } from "app/_types/block";
import { FaArchive } from "react-icons/fa";
import BlockLenses from "@components/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import load from "@lib/load";
import { Button, Tooltip } from "flowbite-react";
import toast from "react-hot-toast";

interface LensProps {
  compact?: boolean;
  invite: LensInvite;
}

export default function LensInviteComponent({ compact, invite }: LensProps) {
  const acceptInvite = () => {
    window.location.href = `acceptInvite/${invite.token}`;
  };

  return (
    <div
      className={clsx(
        "items-start justify-between p-4 rounded-md bg-white border border-gray-200 mb-4",
        compact ? "max-w-xs" : ""
      )}
    >
      <div className="flex flex-col gap-1">
        <div>
          <p>Lens: {invite.lens_id}</p>
          <p>
            {invite.sender} is inviting you to collaborate with the role of:{" "}
            {invite.access_type}
          </p>
        </div>
        <div className="flex items-center justify-between flex-1 mt-2">
          <Button
            className="bg-green-700 rounded text-white"
            onClick={acceptInvite}
          >
            View invitation
          </Button>
        </div>
      </div>
    </div>
  );
}
