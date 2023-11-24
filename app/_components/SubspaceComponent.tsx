import React from "react";
import { Anchor } from "@mantine/core";
import { Divider } from "@mantine/core";
import { Text } from "@mantine/core";

export default function SubspaceComponent({ subspace }) {

  const handleSubspaceClick = () => {
    window.location.href = `${window.location.pathname}/${subspace.lens_id}`;
  };

  return (
    <div className="flex flex-col gap-1">
      <Anchor
        size={"xs"}
        underline="never"
        onClick={handleSubspaceClick}
      >
        <Text size={"md"} fw={600} c="gray.7">{subspace.name}</Text>
      </Anchor>
      <Divider mt={11} mb={6} variant="dashed" />
    </div>
  );
}
