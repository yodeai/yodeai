'use client';

import React, { useState, useEffect, createContext, useContext, use } from 'react';
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { Box, Flex, Button, Menu } from '@mantine/core';
import { FaInfo, FaPlus } from 'react-icons/fa';
import NextImage from 'next/image';
import { IoIosChatbubbles } from 'react-icons/io';
import { useAppContext } from '@contexts/context';
import { cn } from '@utils/style';
import Link from 'next/link';

import ConditionalTooltip from './ConditionalTooltip';
import LensChat from './LensChat';
import { getActiveToolbarTab, setActiveToolbarTab } from '@utils/localStorage';
import { usePathname } from 'next/navigation';

type contextType = {
    activeComponent: "social" | "questionform";
    closeComponent: () => void;
};

const defaultValue: contextType = {
    activeComponent: getActiveToolbarTab(),
    closeComponent: () => { },
}

const context = createContext<contextType>(defaultValue);

export const useToolbarContext = () => {
    return useContext(context);
};

export default function Toolbar() {
    const pathname = usePathname();

    const [activeComponent, setActiveComponent] = useState<contextType["activeComponent"]>(defaultValue.activeComponent);

    const { accessType, subspaceModalDisclosure, lensId } = useAppContext();
    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;

    const closeComponent = () => {
        setActiveComponent(null);
    }

    const switchComponent = (component: contextType["activeComponent"]) => {
        if (activeComponent === component) return closeComponent();
        setActiveComponent(component);
    }

    useEffect(() => {
        setActiveToolbarTab(activeComponent);
    }, [activeComponent]);

    return <Flex direction="row" className="h-[calc(100vh-60px)] w-full">
        { /*toolbar buttons*/}
        <Box component='div' className="h-full bg-white border-l border-l-[#eeeeee]">
            <Flex direction="column" gap={5} className="mt-1 p-1">
                <Box>
                    <Button
                        variant={activeComponent === "questionform" ? "light" : "subtle"}
                        onClick={switchComponent.bind(null, "questionform")} c="gray.6">
                        <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                    </Button>
                </Box>
                <Menu>
                    <Box>
                        <Menu.Target>
                            <Button variant="subtle" c="gray.6">
                                <FaPlus size={18} />
                            </Button>
                        </Menu.Target>
                    </Box>

                    <Menu.Dropdown>
                        <ConditionalTooltip
                            visible={lensId && !["owner", "editor"].includes(accessType)}
                            label="You are not allowed to add new block">
                            <Link href="/new" className={cn("decoration-transparent text-inherit",
                                lensId && !["owner", "editor"].includes(accessType) && "pointer-events-none")}>
                                <Menu.Item disabled={lensId && !["owner", "editor"].includes(accessType)}>Add Block</Menu.Item>
                            </Link>
                        </ConditionalTooltip>
                        <ConditionalTooltip
                            visible={lensId && !["owner", "editor"].includes(accessType)}
                            label="You are not allowed to add new block">
                            <Menu.Item disabled={lensId && !["owner", "editor"].includes(accessType)} onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
                        </ConditionalTooltip>
                    </Menu.Dropdown>
                </Menu>
                <Box>
                    <Button
                        disabled={!lensId}
                        variant={activeComponent === "social" ? "light" : "subtle"}
                        c="gray.6"
                        onClick={switchComponent.bind(null, "social")}>
                        <IoIosChatbubbles size={18} />
                    </Button>
                </Box>
                {/* <Box>
                    <Button variant="transparent">
                        <FaHand size={18} />
                    </Button>
                </Box>
                <Box>
                    <Button variant="transparent">
                        <FaInfo size={18} />
                    </Button>
                </Box> */}
            </Flex>
        </Box>
        <Box component='div' className={cn("bg-white border-l border-l-[#eeeeee]", activeComponent ? "min-w-[350px]" : "w-[0px]")}>
            { /* toolbar content with context */}
            <context.Provider value={{
                closeComponent,
                activeComponent
            }}>
                {activeComponent === "questionform" && <QuestionAnswerForm />}
                {activeComponent === "social" && <LensChat />}
            </context.Provider>
        </Box>
    </Flex >
}