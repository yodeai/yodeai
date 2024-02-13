import React from 'react';
import { Popover, Flex, Image } from '@mantine/core';
import { useAppContext } from '@contexts/context';

export default function OnboardingPopover({ children, width, stepToShow, popoverContent, position }) {
    const { onboardingStep, onboardingIsComplete } = useAppContext();

    const shouldShowPopover = onboardingStep === stepToShow && !onboardingIsComplete;

    return (
        <Popover
            opened={shouldShowPopover}
            position={position}
            withArrow
            width={width}
            offset={10}
            arrowOffset={20}
            arrowSize={15}
            radius={10}
        >
            <Popover.Target>
                {children}
            </Popover.Target>
            <Popover.Dropdown p={15} pt={20} pb={20} style={{ backgroundColor: '#E8F3FC', border: 'none' }}>
                <Flex>
                    <Image src="/yodeai.png" ml={4} alt="yodeai logo" h={36} w={36} />
                    <Flex ml={15} direction="column">
                        {popoverContent}
                    </Flex>
                </Flex>
            </Popover.Dropdown>
        </Popover>
    );
};

{/* <Popover
                width={500}
                opened
                position="right-start"
                offset={20}
                withArrow
                arrowOffset={20}
                arrowSize={15}
                radius={10}
              >
                <Popover.Target>
                  <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
                </Popover.Target>
                <Popover.Dropdown p={15} pt={20} pb={20} style={{ backgroundColor: '#E8F3FC', border: 'none' }}>
                  <Flex>
                    <Image src="/yodeai.png" ml={4} alt="yodeai logo" h={36} w={36} />
                    <Flex ml={15} direction={"column"}>
                      <Text size="md" mb={10}>
                        Welcome to Yodeai! Here are a few <b>tips</b> to help you get familiar with your Yodeai workspace.
                      </Text>
                      <Text size="md" mb={10}>
                        Click the <b>Getting Started</b> space to begin.
                      </Text>
                      <Text size="md">
                        Or, click here to dismiss tips.
                      </Text>
                    </Flex>
                  </Flex>
                </Popover.Dropdown>
              </Popover> */}