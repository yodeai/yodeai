import { Box, Select, Button, } from "@mantine/core"
import { contextType } from "@contexts/context";
import { FaArrowDown } from "@react-icons/all-files/fa/FaArrowDown";
import { FaArrowUp } from "@react-icons/all-files/fa/FaArrowUp";

type SortProps = {
    sortingOptions: contextType["sortingOptions"]
    setSortingOptions: (value: contextType["sortingOptions"]) => void
}

export const Sort = ({ sortingOptions, setSortingOptions }: SortProps) => {
    return <Select
        variant="filled"
        className="inline grow"
        leftSection={<Box>
            <Button
                size="xs"
                variant="subtle"
                px={8}
                mr={5}
                onClick={() => {
                    setSortingOptions({
                        ...sortingOptions,
                        order: sortingOptions.order === "asc" ? "desc" : "asc"
                    })
                }}>
                {sortingOptions.order === "asc"
                    ? <FaArrowDown size={12} className="text-gray-500" />
                    : <FaArrowUp size={12} className="text-gray-500" />}
            </Button>
        </Box>}
        placeholder="Sort by"
        size="sm"
        data={[
            { value: "name", label: "Name" },
            { value: "createdAt", label: "Created At" },
            { value: "updatedAt", label: "Updated At" },
            { value: "type", label: "Type" }
        ]}
        allowDeselect={true}
        value={sortingOptions.sortBy}
        onChange={(value: contextType["sortingOptions"]["sortBy"]) => {
            setSortingOptions({ ...sortingOptions, sortBy: value })
        }}
    />
}