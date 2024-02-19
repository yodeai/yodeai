"use client";

import formatDate from "@lib/format-date";
import { useAppContext } from "@contexts/context";
import { Lens } from "app/_types/lens";

import { NavLink, Text } from "@mantine/core";
import Link from "next/link";
import icons from "./IconView/_icons";
import { MdFolderShared, MdFolder } from "react-icons/md";

interface LensProps {
  compact?: boolean;
  lens: Lens;
  rightSection?: React.ReactNode;
}
export default function LensComponent({ lens, compact = false, rightSection }: LensProps) {
  const { lensId, user } = useAppContext(); // the selected lens retrieved from the context

  const leftIcon = lens.shared
    ? <MdFolderShared size={28} fill="#999" />
    : <MdFolder size={28} fill="#999" />;
  return (
    <Link href={`/lens/${lens.lens_id}`} prefetch className="no-underline w-min">
      <NavLink
        component="div"
        label={<Text lh={1.2} size={"sm"} className="max-w-[150px]">{lens.name}</Text>}
        description={<>
          <Text c="gray" fw={400} size="xs">{formatDate(lens.updated_at)}</Text>
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