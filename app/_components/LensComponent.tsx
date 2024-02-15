"use client";

import formatDate from "@lib/format-date";
import { useRouter } from "next/navigation";
import { useAppContext } from "@contexts/context";
import { Lens } from "app/_types/lens";
import { RiPushpinFill } from "react-icons/ri";

import { useState, useEffect } from "react";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { NavLink, Text } from "@mantine/core";
import Link from "next/link";
interface LensProps {
  compact?: boolean;
  lens: Lens;
  rightSection?: React.ReactNode;
}
export default function LensComponent({ lens, compact = false, rightSection }: LensProps) {
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
        component="div"
        label={<Text lh={1.2} size={"sm"} className="max-w-[150px]">{lens.name}</Text>}
        description={!compact && <>
          <Text c="gray" fw={400} size="xs">{formatDate(lens.updated_at)}</Text>
          {lens.shared && (
            <Text c="blue" size="xs">
              Collaborative: {lens?.user_to_access_type?.[user?.id] ?? ''}
            </Text>
          )}
          <Text c={'green'} size="xs">
            {lens.public ? 'Published' : 'Not Published'}
          </Text>
        </>
        }
        leftSection={<RiPushpinFill size={18} />}
        rightSection={rightSection}
        active
        color={Number(lensId) !== lens.lens_id ? '#888' : 'blue'}
        variant={Number(lensId) !== lens.lens_id ? 'subtle' : 'light'}
      />
    </Link>
  );
}