import LoadingSkeleton from "@components/LoadingSkeleton";
import { ModalsContainer } from "@components/Modals";
import { ActionIcon, Box, Divider, Flex, Input, MantineColor, Menu, Text, UnstyledButton } from "@mantine/core";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { useEffect, useRef, useState } from "react";

type PageHeaderProps = {
    title: string;
    secondaryItem?: JSX.Element;
    onSaveTitle?: (newTitle: string) => void;
    closeEditMode?: () => void;
    editMode?: boolean;
    loading?: boolean;
    dropdownItems?: {
        label: string;
        onClick: () => void;
        color?: MantineColor
        disabled?: boolean
    }[]
    actions?: JSX.Element;
    accessType?: "owner" | "editor" | "reader";
}
export const PageHeader = ({
    title,
    secondaryItem,
    onSaveTitle,
    closeEditMode,
    editMode = false,
    loading = false,
    dropdownItems,
    actions,
    accessType
}: PageHeaderProps) => {
    const matchMobileView = useMediaQuery("(max-width: 768px)");
    const [titleValue, setTitleValue] = useState(title);

    const $initialTitle = useRef(title);

    const $inputContainer = useRef<HTMLInputElement>(null);
    const $inputWrapper = useClickOutside<HTMLInputElement>(() => {
        onSaveTitle(titleValue);
    });

    useEffect(() => {
        setTitleValue(title);
    }, [title])

    useEffect(() => {
        if (editMode) {
            $inputContainer.current?.focus();
            $inputContainer.current?.setSelectionRange(0, $inputContainer.current?.value.length);
        }
    }, [editMode]);

    const handleChange = (e) => {
        setTitleValue(e.target.value);
    }

    const handleKeyPress = (e) => {
        if (e.key === "Escape") {
            setTitleValue($initialTitle.current);
            closeEditMode();
            return;
        }
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

    return <>
        <ModalsContainer
            accessType={accessType}
        />
        <Flex
            className="sticky top-0 border-b border-gray-200"
            direction={
                matchMobileView && (actions || secondaryItem) ? "column" : "row"
            }
            justify="space-between">
            <Menu shadow="md" position="bottom-start" width={150}>
                <Flex align="center" gap="xs" className="px-4 py-2 h-[60px]">
                    {!editMode && <Box className="grow">
                        <Text span={true} c={"gray.7"} size="xl" fw={700}>{title}</Text>
                        {dropdownItems && <Menu.Target>
                            <UnstyledButton>
                                <FaAngleDown size={18} className="mt-2 ml-1 text-gray-500" />
                            </UnstyledButton>
                        </Menu.Target>}
                    </Box> || ""}
                    {editMode && <div ref={$inputWrapper} className="flex align-middle items-center gap-3">
                        <Input
                            classNames={{
                                wrapper: "w-[300px]",
                                input: "w-full inline-block text-xl border border-gray-400 rounded-md outline-none focus:border-gray-500"
                            }}
                            ref={$inputContainer}
                            unstyled
                            fw={700}
                            c={"gray.7"}
                            size="xl"
                            value={titleValue}
                            onChange={handleChange}
                            onKeyDown={handleKeyPress}
                        />
                        <ActionIcon
                            size="md"
                            color="green"
                            variant="gradient"
                            gradient={{ from: 'green', to: 'lime', deg: 116 }}
                            onClick={() => onSaveTitle(titleValue)}
                        >
                            <FaCheck size={14} />
                        </ActionIcon>
                    </div>}
                    {secondaryItem && <Box>
                        <Divider orientation="vertical" className="mx-3" />
                        {secondaryItem}
                    </Box>}
                </Flex>
                {dropdownItems && Array.isArray(dropdownItems) && <Menu.Dropdown>
                    {dropdownItems.map((item, i) => <Menu.Item key={i} color={item.color} disabled={item.disabled} onClick={item.onClick}>{item.label}</Menu.Item>)}
                </Menu.Dropdown> || ""}
            </Menu>

            <Divider />

            <Flex justify="flex-end" align="center" className="h-[60px]">
                <div className="grow px-4">
                    {actions}
                </div>
                <Divider orientation="vertical" className="block sm:hidden" />
                <div id="toolbar_mobile_button" className="block sm:hidden p-2"></div>
            </Flex>
        </Flex>
    </>
}