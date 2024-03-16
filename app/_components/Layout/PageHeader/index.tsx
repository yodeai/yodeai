import LoadingSkeleton from "@components/LoadingSkeleton";
import { Box, Divider, Flex, MantineColor, Menu, Text, UnstyledButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { useEffect, useRef, useState } from "react";

type PageHeaderProps = {
    title: string;
    onSaveTitle?: (newTitle: string) => void;
    editMode?: boolean;
    loading?: boolean;
    dropdownItems?: {
        label: string;
        onClick: () => void;
        color?: MantineColor
        disabled?: boolean
    }[]
    actions?: JSX.Element
}
export const PageHeader = ({
    title,
    onSaveTitle,
    editMode = false,
    loading = false,
    dropdownItems,
    actions
}: PageHeaderProps) => {
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [titleValue, setTitleValue] = useState(title);

    useEffect(() => {
        setTitleValue(title);
    }, [title])

    useEffect(() => {
        if (editMode) {
            titleInputRef.current?.focus();
            titleInputRef.current?.setSelectionRange(0, titleInputRef.current?.value.length);
        }
    }, [editMode]);

    const handleChange = (e) => {
        setTitleValue(e.target.value);
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            onSaveTitle(titleValue);
        }
    }

    if (loading) {
        return <Flex className="border-b border-gray-200 py-2 px-4" direction={matchMobileView ? "column" : "row"} rowGap="sm" justify="space-between">
            <LoadingSkeleton w={"140px"} boxCount={1} m={3} lineHeight={30} />
            <LoadingSkeleton w={"80px"} boxCount={1} m={3} lineHeight={30} />
        </Flex>
    }

    return <Flex className="border-b border-gray-200" direction={matchMobileView ? "column" : "row"} justify="space-between">
        <Menu shadow="md" position="bottom-start" width={150}>
            <Flex align="center" gap="sm" className="px-4 py-2">
                {!editMode && <Box className="grow">
                    <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>
                    {dropdownItems && <Menu.Target>
                        <UnstyledButton>
                            <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                        </UnstyledButton>
                    </Menu.Target>}
                </Box> || ""}
                {editMode &&
                    <input ref={titleInputRef} className="border-0 bg-transparent text-xl font-bold w-[450px]"
                        value={titleValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                    />}
            </Flex>
            {dropdownItems && Array.isArray(dropdownItems) && <Menu.Dropdown>
                {dropdownItems.map((item, i) => <Menu.Item key={i} color={item.color} disabled={item.disabled} onClick={item.onClick}>{item.label}</Menu.Item>)}
            </Menu.Dropdown> || ""}
        </Menu>

        <Divider />

        <Flex justify="flex-end">
            <div className="p-2">
                {actions}
            </div>
            <Divider orientation="vertical" className="block sm:hidden" />
            <div id="toolbar_mobile_button" className="block sm:hidden p-2"></div>
        </Flex>
    </Flex>

}