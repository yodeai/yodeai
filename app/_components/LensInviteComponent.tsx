import React from "react";

import { LensInvite } from "app/_types/block";
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
