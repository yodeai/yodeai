"use client";

import { Whiteboard } from "app/_types/lens";
import { BiSolidChalkboard } from "react-icons/bi";
import { Divider, Text, Flex, Grid } from "@mantine/core";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@utils/index";

interface WhiteboardLineComponentProps {
  whiteboard: Whiteboard;
  hasArchiveButton?: boolean
  onArchive?: () => void;
  hierarchy?: number;
}
export default function WhiteboardLineComponent(props: WhiteboardLineComponentProps) {
  const { whiteboard, hasArchiveButton = false, onArchive, hierarchy = 0 } = props;
  const router = useRouter();

  return (
    <div>
      <Flex pl={2} pr={2} direction={"column"}>
        <Grid>
          <Grid.Col span={10}>
            <Flex align={"center"} direction={"row"}>
              <BiSolidChalkboard size={16} color="gray" className="mr-2" />
              <Link href={`/whiteboards/${whiteboard.whiteboard_id}`} className="text-inherit no-underline">
                <Text size={"md"} fw={500} c="gray.7">{whiteboard.name}</Text>
              </Link>
            </Flex>
          </Grid.Col>
          <Grid.Col span={2}>
            <Flex mt={5} justify={"end"} align={"center"} direction={"row"}>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(whiteboard.created_at)}
              </Text>
            </Flex>
          </Grid.Col>
        </Grid>
      </Flex>
      <Divider style={{ marginLeft: Math.min(26 * hierarchy, 300) }} mt={11} mb={6} variant="dashed" />
    </div >
  );
}