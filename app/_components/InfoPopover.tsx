import { Popover, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { FaInfoCircle } from "react-icons/fa";

const InfoPopover = ({ infoText }) => {
    const [opened, { close, open }] = useDisclosure(false);
  
    return (
      <Popover width={200} offset={0} position="top" withArrow shadow="md" opened={opened}>
        <Popover.Target>
          <UnstyledButton variant="unstyled" onMouseEnter={open} onMouseLeave={close} style={{ cursor: 'pointer' }}>
            <FaInfoCircle size={12} style={{ marginBottom: -0.73, marginLeft: 4 }} color='#339AF0' />
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
          <Text ta={"center"} size="sm">{infoText}</Text>
        </Popover.Dropdown>
      </Popover>
    );
  };

  export default InfoPopover;