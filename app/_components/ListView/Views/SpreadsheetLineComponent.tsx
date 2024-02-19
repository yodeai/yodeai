"use client";

import { Divider, Text, Flex, Grid } from "@mantine/core";
import Link from "next/link";
import { timeAgo } from "@utils/index";
import { Tables } from "app/_types/supabase";
import { FaFileExcel } from "react-icons/fa";

interface SpreadsheetLineComponentProps {
  spreadsheet: Tables<"spreadsheet">;
}
export default function SpreadsheetLineComponent({
  spreadsheet
}: SpreadsheetLineComponentProps) {
  return (
    <div>
      <Flex pl={2} pr={2} direction={"column"}>
        <Grid>
          <Grid.Col span={10}>
            <Flex align={"center"} direction={"row"}>
              <FaFileExcel size={16} color="gray" className="mr-2" />
              <Link href={`/spreadsheet/${spreadsheet.spreadsheet_id}`} className="text-inherit no-underline">
                <Text size={"md"} fw={500} c="gray.7">{spreadsheet.name}</Text>
              </Link>
            </Flex>
          </Grid.Col>
          <Grid.Col span={2}>
            <Flex mt={5} justify={"end"} align={"center"} direction={"row"}>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(spreadsheet.updated_at || spreadsheet.created_at)}
              </Text>
              <Text style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 88.5, fontSize: 13 }} size={"sm"} fw={400} c="gray">
                {timeAgo(spreadsheet.created_at)}
              </Text>
            </Flex>
          </Grid.Col>
        </Grid>
      </Flex>
      <Divider mt={11} mb={6} variant="dashed" />
    </div >
  );
}