import React from "react";
import formatDate from "@lib/format-date";
import clsx from "clsx";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Block, LensInvite } from "app/_types/block";
import { FaArchive } from "react-icons/fa";
import BlockLenses from "@components/Block/BlockLenses";
import apiClient from "@utils/apiClient";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import load from "@lib/load";
import toast from "react-hot-toast";
import { Button, Paper, Text } from "@mantine/core";
import Link from "next/link";

interface LensProps {
  compact?: boolean;
  invite: LensInvite;
}

export default function LensInviteComponent({ compact, invite }: LensProps) {
  return (
    <Paper withBorder p={8}>
      <div className="flex flex-col gap-1">
        <div>
          <Text size="sm" fw={500} c={"gray.7"}>Space ID: {invite.lens_id}</Text>
          <Text size="sm" fw={400} c={"gray.7"}>
            {invite.sender} is inviting you to collaborate with the role of:{" "}
            {invite.access_type}
          </Text>
        </div>
        <div className="flex items-center justify-between flex-1">
          <Link href={`acceptInvite/${invite.token}`}>
            <Button
              style={{ width: '100%', height: 24 }}
              size="xs"
              variant="light"
            >
              View invitation
            </Button>
          </Link>
        </div>
      </div>
    </Paper>
  );
}
