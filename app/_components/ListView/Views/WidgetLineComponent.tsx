"use client";

import { BiSolidChalkboard } from "@react-icons/all-files/bi/BiSolidChalkboard";
import { Divider, Text, Flex, Grid } from "@mantine/core";
import Link from "next/link";
import { timeAgo } from "@utils/index";
import { Tables } from "app/_types/supabase";
import { FaPuzzlePiece } from "@react-icons/all-files/fa6/FaPuzzlePiece";

interface WidgetLineComponentProps {
  widget: Tables<"widget">
}
export default function WidgetLineComponent({ widget }: WidgetLineComponentProps) {
  return (
    <div>
      <Flex pl={2} pr={2} direction={"column"}>
        <Grid>
          <Grid.Col span={10}>
            <Flex align={"center"} direction={"row"}>
              <FaPuzzlePiece size={16} color="gray" className="mr-2" />
              <Link href={`/widget/${widget.widget_id}`} className="text-inherit no-underline">
                <Text size={"md"} fw={500} c="gray.7">{widget.name}</Text>
              </Link>
            </Flex>
          </Grid.Col>
          <Grid.Col span={2}>
            <Flex mt={5} justify={"end"} align={"center"} direction={"row"}>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(widget.updated_at || widget.created_at)}
              </Text>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(widget.created_at)}
              </Text>
            </Flex>
          </Grid.Col>
        </Grid>
      </Flex>
      <Divider mt={11} mb={6} variant="dashed" />
    </div >
  );
}