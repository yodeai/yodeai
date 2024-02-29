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
            styles={{
                arrow: {
                    border: 'none',
                },
                dropdown: {
                    zIndex: 2000
                }
            }}
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