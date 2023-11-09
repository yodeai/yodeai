import { Popover, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { FaInfoCircle } from "react-icons/fa";

const InfoPopover = ({ infoText }) => {
    const [opened, { close, open }] = useDisclosure(false);
  
    return (
      <Popover width={200} offset={0} position="bottom" withArrow shadow="md" opened={opened}>
        <Popover.Target>
          <UnstyledButton variant="unstyled" onMouseEnter={open} onMouseLeave={close} style={{ cursor: 'pointer' }}>
            <FaInfoCircle size={14.5} style={{ top: 2 }} color='#339AF0' />
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown style={{ pointerEvents: 'none' }}>
          <Text size="sm">{infoText}</Text>
        </Popover.Dropdown>
      </Popover>
    );
  };

  export default InfoPopover;