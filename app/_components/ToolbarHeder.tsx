import { Flex, Box, UnstyledButton } from '@mantine/core';
import { FaCross } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { useToolbarContext } from './Toolbar';

type ToolbarHeaderProps = {
    children: React.ReactNode;
}
export default function ToolbarHeader({
    children
}: ToolbarHeaderProps) {
    const { closeComponent } = useToolbarContext();
    return <Flex justify={"space-between"} className="w-full p-4">
        <Box>
            {children}
        </Box>
        <Box>
            <UnstyledButton p={0} m={0} onClick={closeComponent}>
                <IoMdClose size={22} />
            </UnstyledButton>
        </Box>
    </Flex>
}