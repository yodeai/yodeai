"use client";
import Button from "@components/Button";
import formatDate from "@lib/format-date";
import load from "@lib/load";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAppContext } from "@contexts/context";
import { Lens } from "app/_types/lens";
import { ShadowInnerIcon } from "@radix-ui/react-icons";
import { FaSquare, FaStar, FaThLarge, FaFolder, FaFolderOpen, FaCube } from "react-icons/fa";
import { useState, useEffect } from "react";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NavLink, Text } from "@mantine/core";

interface LensProps {
  compact?: boolean;
  lens: Lens;
}
export default function LensComponent({ lens, compact }: LensProps) {
  const router = useRouter();
  const { lensId, setLensId } = useAppContext(); // the selected lens retrieved from the context
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();
  const handleLensClick = (e: React.MouseEvent) => {
    setLensId(lens.lens_id.toString());
    router.push(`/lens/${lens.lens_id}`);
  };
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user);
    }
    getUser()
  }, [])

  return (
    <NavLink
      label={lens.name}
      onClick={handleLensClick}
      description={
        <>
          <Text mt={-2.5} c="gray" fw={400} size="xs">{formatDate(lens.updated_at)}</Text>
          {lens.shared && (
            <Text c="blue" size="xs">
              Collaborative: {lens.user_to_access_type[user?.id] ?? ''}
            </Text>
          )}
          <Text c={'green'} size="xs">
            {lens.public ? 'Published' : 'Private'}
          </Text>
        </>
      }
      leftSection={<FaCube size={14} />}
      active
      color={Number(lensId) !== lens.lens_id ? '#888' : 'blue'}
      variant={Number(lensId) !== lens.lens_id ? 'subtle' : 'light'}
    />
  );
}