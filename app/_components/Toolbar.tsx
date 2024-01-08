'use client';

import React, { useState, useEffect, createContext, useContext, use, useMemo } from 'react';
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
    activeToolbarComponent: "social" | "questionform";
    closeComponent: () => void;
};

const defaultValue: contextType = {
    activeToolbarComponent: getActiveToolbarTab(),
    closeComponent: () => { },
}

const context = createContext<contextType>(defaultValue);

export const useToolbarContext = () => {
    return useContext(context);
};

export default function Toolbar() {
    const pathname = usePathname();

    const [activeToolbarComponent, setActiveToolbarComponent] = useState<contextType["activeToolbarComponent"]>(defaultValue.activeToolbarComponent);

    const { accessType, subspaceModalDisclosure, whiteboardModelDisclosure, lensId } = useAppContext();

    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;
    const [whiteboardModalState, whiteboardModalController] = whiteboardModelDisclosure;

    const closeComponent = () => {
        setActiveToolbarComponent(null);
    }

    const switchComponent = (component: contextType["activeToolbarComponent"]) => {
        if (activeToolbarComponent === component) return closeComponent();
        setActiveToolbarComponent(component);
    }

    useEffect(() => {
        setActiveToolbarTab(activeToolbarComponent);
    }, [activeToolbarComponent]);

    const allowedToCreateNewItem = useMemo(() => {
        return (lensId && ["owner", "editor"].includes(accessType))
            || ["/"].includes(pathname);
    }, [accessType, lensId, pathname]);

    useEffect(() => {
        if(!lensId && activeToolbarComponent === "social") closeComponent();
    }, [lensId])

    return <Flex direction="row" className="h-[calc(100vh-60px)] w-full z-50">
        { /*toolbar buttons*/}
        <Box component='div' className="h-full bg-white border-l border-l-[#eeeeee]">
            <Flex direction="column" gap={5} className="mt-1 p-1">
                <Box>
                    <Button
                        variant={activeToolbarComponent === "questionform" ? "light" : "subtle"}
                        onClick={switchComponent.bind(null, "questionform")} c="gray.6">
                        <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                    </Button>
                </Box>
                <ConditionalTooltip visible={!allowedToCreateNewItem} label="You are not allowed to add new items on this space.">
                    <Menu position="left">
                        <Box>
                            <Menu.Target>
                                <Button disabled={!allowedToCreateNewItem} variant="subtle" c="gray.6">
                                    <FaPlus size={18} />
                                </Button>
                            </Menu.Target>
                        </Box>
                        <Menu.Dropdown>
                            <Link href="/new" className="decoration-transparent text-inherit">
                                <Menu.Item>Add Block</Menu.Item>
                            </Link>
                            <Menu.Item onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
                            <Menu.Item onClick={whiteboardModalController.open}>Add Whiteboard</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </ConditionalTooltip>
                <Box>
                    <Button
                        disabled={!lensId}
                        variant={activeToolbarComponent === "social" ? "light" : "subtle"}
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
        </Box >
        <Box component='div' className={cn("bg-white border-l border-l-[#eeeeee]", activeToolbarComponent ? "min-w-[400px] max-w-[400px]" : "w-[0px]")}>
            { /* toolbar content with context */}
            <context.Provider value={{
                closeComponent,
                activeToolbarComponent
            }}>
                {activeToolbarComponent === "questionform" && <QuestionAnswerForm />}
                {activeToolbarComponent === "social" && <LensChat />}
            </context.Provider>
        </Box>
    </Flex >
}