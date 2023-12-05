"use client";
import { notFound } from "next/navigation";
import { Block } from "app/_types/block";
import { Lens } from "app/_types/lens";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LensComponent from "@components/LensComponent";
import { Flex, Text, Divider } from "@mantine/core";
import LoadingSkeleton from "@components/LoadingSkeleton";

export default function Inbox() {
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [loading, setLoading] = useState(true);

  const getLenses = async () => {

    return fetch(`/api/lens/getAll`)
      .then((response) => response.json())
      .then((data) => {
        setLenses(data.data);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        notFound();
      }).finally(() => {
        setLoading(false);
      })
  }

  useEffect(() => {
    getLenses();
  }, []);

  return (
    <Flex direction="column" p={16} pt={0}>
      <Divider mb={0} size={1.5} label={<Text c={"gray.7"} size="sm" fw={500}>Home</Text>} labelPosition="center" />
      {loading &&
        <div className="mt-2">
          <LoadingSkeleton boxCount={10} lineHeight={80} m={0} />
        </div>}

      {!loading && (lenses.length > 0
        ? lenses.map((lens) => (
          <LensComponent key={lens.lens_id} lens={lens} compact={true} />
        ))
        : <Text size={"sm"} c={"gray.7"} ta={"center"} mt={30}>
          Nothing to show here. You have no spaces yet.
        </Text>
      ) || ""}
    </Flex >
  );
}