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
import Link from "next/link";
interface LensProps {
  compact?: boolean;
  lens: Lens;
  rightSection?: React.ReactNode;
}
export default function LensComponent({ lens, compact, rightSection }: LensProps) {
  const router = useRouter();
  const { lensId, setLensId } = useAppContext(); // the selected lens retrieved from the context
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user);
    }
    getUser()
  }, [])

  return (
    <Link href={`/lens/${lens.lens_id}`} prefetch className="no-underline">
      <NavLink
        label={<Text lh={1.2} size={"sm"}>{lens.name}</Text>}
        description={
          <>
            <Text c="gray" fw={400} size="xs">{formatDate(lens.updated_at)}</Text>
            {lens.shared && (
              <Text c="blue" size="xs">
                Collaborative: {lens.user_to_access_type[user?.id] ?? ''}
              </Text>
            )}
            <Text c={'green'} size="xs">
              {lens.public ? 'Published' : 'Not Published'}
            </Text>
          </>
        }
        leftSection={<FaCube size={18} />}
        rightSection={rightSection}
        active
        color={Number(lensId) !== lens.lens_id ? '#888' : 'blue'}
        variant={Number(lensId) !== lens.lens_id ? 'subtle' : 'light'}
      />
    </Link>
  );
}