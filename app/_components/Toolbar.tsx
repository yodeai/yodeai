'use client';

import React, { useState, useEffect, createContext, useContext, use, useMemo } from 'react';
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { Box, Flex, Button, Menu } from '@mantine/core';
import { FaAngleRight, FaArrowCircleRight, FaInfo, FaPlus } from 'react-icons/fa';
import NextImage from 'next/image';
import { IoIosChatbubbles } from 'react-icons/io';
import { useAppContext } from '@contexts/context';
import { cn } from '@utils/style';
import Link from 'next/link';

import ConditionalTooltip from './ConditionalTooltip';
import LensChat from './LensChat';
import { getActiveToolbarTab, setActiveToolbarTab } from '@utils/localStorage';
import { usePathname } from 'next/navigation';
import JiraIssuesViewer from './JiraIssuesViewer';

type contextType = {
    activeToolbarComponent: "social" | "questionform" | "jira";
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

    const { accessType, subspaceModalDisclosure, whiteboardModelDisclosure, userInsightsDisclosure, competitiveAnalysisDisclosure, lensId } = useAppContext();

    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;
    const [whiteboardModalState, whiteboardModalController] = whiteboardModelDisclosure;
    const [userInsightsModalState, userInsightsModalController] = userInsightsDisclosure;
    const [competitiveAnalysisModalState, competitiveAnalysisModalController] = competitiveAnalysisDisclosure;

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

    const disabledItems = useMemo<{
        block?: string;
        whiteboard?: string;
        subspace?: string;
        plugin?: string;
    }>(() => {
        if (lensId && ["owner", "editor"].includes(accessType) === false) {
            return {
                block: "Your access level does not allow you to add new blocks on this space.",
                whiteboard: "Your access level does not allow you to add new whiteboards on this space.",
                subspace: "Your access level does not allow you to add new subspaces on this space.",
                plugin: "Your access level does not allow you to add new plugins on this space."
            }
        }
        if (["/"].includes(pathname)) {
            return {
                block: "It is not allowed to add new blocks on the home page.",
                whiteboard: "It is not allowed to add new whiteboards on the home page.",
                plugin: "Your access level does not allow you to add new plugins on this space."
            }
        }
        if (["/myblocks"].includes(pathname)) {
            return {
                subspace: "It is not allowed to add new subspaces on the My Blocks page.",
                whiteboard: "It is not allowed to add new whiteboards on the My Blocks page.",
                plugin: "Your access level does not allow you to add new plugins on this space."
            }
        }
        if (["/inbox"].includes(pathname)) {
            return {
                block: "It is not allowed to add new blocks on the Inbox page.",
                whiteboard: "It is not allowed to add new whiteboards on the Inbox page.",
                subspace: "It is not allowed to add new subspaces on the Inbox page.",
                plugin: "Your access level does not allow you to add new plugins on this space."
            }
        }

        return {}
    }, [accessType, lensId, pathname]);

    useEffect(() => {
        if (!lensId && activeToolbarComponent === "social") closeComponent();
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
                <Menu position="left">
                    <Box>
                        <Menu.Target>
                            <Button variant="subtle" c="gray.6">
                                <FaPlus size={18} />
                            </Button>
                        </Menu.Target>
                    </Box>
                    <Menu.Dropdown>
                        <ConditionalTooltip visible={"block" in disabledItems} label={disabledItems.block}>
                            <Link href="/new" className={cn(
                                "block decoration-transparent text-inherit bg-gray h-full w-full",
                                "block" in disabledItems && "pointer-events-none" || "")}>
                                <Menu.Item disabled={"block" in disabledItems}>
                                    Add Block
                                </Menu.Item>
                            </Link>
                        </ConditionalTooltip>
                        <ConditionalTooltip visible={"subspace" in disabledItems} label={disabledItems.subspace}>
                            <Menu.Item disabled={"subspace" in disabledItems} onClick={subspaceModalController.open}>Add Subspace</Menu.Item>
                        </ConditionalTooltip>
                        <ConditionalTooltip visible={"whiteboard" in disabledItems} label={disabledItems.whiteboard}>
                            <Menu.Item disabled={"whiteboard" in disabledItems} onClick={whiteboardModalController.open}>Add Whiteboard</Menu.Item>
                        </ConditionalTooltip>
                        <Menu position="left" shadow="md" width={200} trigger="hover">
                            <Menu.Target>
                                <Menu.Item rightSection={<FaAngleRight className="text-gray-400" size={12} />} disabled={"plugin" in disabledItems}>
                                    Add Plugin
                                </Menu.Item>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={userInsightsModalController.open}>User Insight</Menu.Item>
                                <Menu.Item onClick={competitiveAnalysisModalController.open}>Competitive Analysis</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Menu.Dropdown>
                </Menu>
                <Box>
                    <Button
                        disabled={!lensId}
                        variant={activeToolbarComponent === "social" ? "light" : "subtle"}
                        c="gray.6"
                        onClick={switchComponent.bind(null, "social")}>
                        <IoIosChatbubbles size={18} />
                    </Button>
                </Box>
                <Box>
                    <Button
                        // disabled={activeComponent !== "jira"}
                        variant={activeToolbarComponent === "jira" ? "light" : "subtle"}
                        c="gray.6"
                        onClick={switchComponent.bind(null, "jira")}>
                        <FaJira size={18} />
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
                {activeToolbarComponent === "jira" && <JiraIssuesViewer />}
                {activeToolbarComponent === "questionform" && <QuestionAnswerForm />}
                {activeToolbarComponent === "social" && <LensChat />}
            </context.Provider>
        </Box>
    </Flex >
}
