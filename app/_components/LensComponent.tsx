"use client";

import formatDate from "@lib/format-date";
import { useAppContext } from "@contexts/context";
import { Lens } from "app/_types/lens";

import { NavLink, Text } from "@mantine/core";
import Link from "next/link";
import icons from "./IconView/_icons";

interface LensProps {
  compact?: boolean;
  lens: Lens;
  rightSection?: React.ReactNode;
}
export default function LensComponent({ lens, compact = false, rightSection }: LensProps) {
  const { lensId, user } = useAppContext(); // the selected lens retrieved from the context

  const leftIcon = lens.shared
    ? <icons.shared_subspace transform="scale(0.6), translate(-10, 0)" fill="#999" />
    : <span className="pr-3"><icons.subspace size={18} fill="#999" /></span>

  return (
    <Link href={`/lens/${lens.lens_id}`} prefetch className="no-underline w-min">
      <NavLink
        classNames={{ section: "!contents" }}
        component="div"
        label={<Text lh={1.2} size={"sm"}>{lens.name}</Text>}
        description={<>
          <Text c="gray" fw={400} size="xs">Last update {formatDate(lens.updated_at)}</Text>
          {!compact && <>
            {lens.shared && (
              <Text c="blue" size="xs">
                Collaborative: {lens?.user_to_access_type?.[user?.id] ?? ''}
              </Text>
            )}
            <Text c={'green'} size="xs">
              {lens.public ? 'Published' : 'Not Published'}
            </Text>
          </>}
        </>
        }
        leftSection={leftIcon}
        rightSection={rightSection}
        active
        color={Number(lensId) !== lens.lens_id ? '#888' : 'blue'}
        variant={Number(lensId) !== lens.lens_id ? 'subtle' : 'light'}
      />
    </Link>
  );
}