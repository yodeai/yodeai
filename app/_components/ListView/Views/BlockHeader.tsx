import { Flex, Grid, Text } from "@mantine/core";

export default function BlockHeader() {
    return (
        <Grid>
            <Grid.Col span={9}>
                {/* <Text ml={2} size={"sm"} fw={500} c="gray.6">{"Name"}</Text> */}
            </Grid.Col>
            <Grid.Col span={3}>
                <Flex justify={"end"}>
                    <Text ml={-1} fw={500} style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 98 }} c="gray.6">{"Last modified"}</Text>
                    <Text ml={-1} fw={500} style={{ fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 98 }} c="gray.6">{"Created date"}</Text>
                </Flex>
            </Grid.Col>
        </Grid>
    )
}
