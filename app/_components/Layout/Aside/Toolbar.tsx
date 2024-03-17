'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { Box, Flex, Button, Menu, Text, Anchor, AppShell, Portal, Divider, MantineProvider } from '@mantine/core';
import NextImage from 'next/image';
import { useAppContext } from '@contexts/context';
import { cn } from '@utils/style';
import Link from 'next/link';

import ConditionalTooltip from '../../ConditionalTooltip';
import LensChat from '../../LensChat';
import { getActiveToolbarTab, setActiveToolbarTab } from '@utils/localStorage';
import { usePathname, useRouter } from 'next/navigation';
import OnboardingPopover from '../../Onboarding/OnboardingPopover';

import { FaAngleRight } from '@react-icons/all-files/fa/FaAngleRight';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { IoIosChatbubbles } from '@react-icons/all-files/io/IoIosChatbubbles';
import { render } from 'react-dom';
import { usePortal } from 'app/_hooks/usePortal';

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
    const router = useRouter();

    const { onboardingStep, onboardingIsComplete, goToNextOnboardingStep } = useAppContext();

    const [activeToolbarComponent, setActiveToolbarComponent] = useState<contextType["activeToolbarComponent"]>(defaultValue.activeToolbarComponent);

    const {
        accessType, subspaceModalDisclosure, lensId,
        whiteboardModelDisclosure, userInsightsDisclosure, competitiveAnalysisDisclosure, spreadsheetModalDisclosure,
        painPointTrackerModalDisclosure, widgetFormDisclosure,
        toolbarDisclosure: [toolbarOpened, toolbarDisclosure]
    } = useAppContext();

    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;
    const [whiteboardModalState, whiteboardModalController] = whiteboardModelDisclosure;
    const [userInsightsModalState, userInsightsModalController] = userInsightsDisclosure;
    const [competitiveAnalysisModalState, competitiveAnalysisModalController] = competitiveAnalysisDisclosure;
    const [spreadsheetModalState, spreadsheetModalController] = spreadsheetModalDisclosure;
    const [painPointTrackerModalState, painPointTrackerModalController] = painPointTrackerModalDisclosure;
    const [widgetFormState, widgetFormController] = widgetFormDisclosure;

    const [menuOpened, setMenuOpened] = useState(false);

    const handlePlusIconClick = () => {
        if (onboardingStep === 3 && !onboardingIsComplete) {
            goToNextOnboardingStep();
        }
        setMenuOpened(true); // Open the menu programmatically
    };

    const closeComponent = () => {
        setActiveToolbarComponent(null);
        toolbarDisclosure.close();
    }

    const switchComponent = (component: contextType["activeToolbarComponent"]) => {
        if (activeToolbarComponent === component) {
            toolbarDisclosure.close();
            return closeComponent();
        }
        setActiveToolbarComponent(component);
        toolbarDisclosure.open();
    }

    useEffect(() => {
        if (toolbarOpened && !activeToolbarComponent) {
            setActiveToolbarComponent(getActiveToolbarTab() || "questionform");
        }
    }, [toolbarOpened, activeToolbarComponent])

    useEffect(() => {
        setActiveToolbarTab(activeToolbarComponent);
    }, [activeToolbarComponent]);

    const disabledItems = useMemo<{
        block?: string;
        whiteboard?: string;
        subspace?: string;
        plugin?: string;
        spreadsheet?: string;
    }>(() => {
        if (lensId && ["owner", "editor"].includes(accessType) === false) {
            return {
                block: "Only editors and owners can add new pages to this space.",
                whiteboard: "Only editors and owners can add new whiteboards to this space.",
                subspace: "Only editors and owners can add new subspaces to this space.",
                plugin: "Only editors and owners can add new plugins to this space.",
                spreadsheet: "Only editors and owners can add new spreadsheets on this space."
            }
        }
        if (["/"].includes(pathname)) {
            return {
                block: "Cannot add new pages to the home page.",
                whiteboard: "Cannot add new whiteboards to the home page.",
                plugin: "Cannot add new plugins to this space.",
                spreadsheet: "Cannot add new spreadsheets on this space."
            }
        }
        if (["/myblocks"].includes(pathname)) {
            return {
                subspace: "Cannot add new subspaces to My Pages.",
                whiteboard: "Cannot add new whiteboards to My Pages.",
                plugin: "Cannot add new plugins to this space.",
                spreadsheet: "Cannot add new spreadsheets on this space."
            }
        }
        if (["/inbox"].includes(pathname)) {
            return {
                block: "Cannot add new pages to the Inbox.",
                whiteboard: "Cannot add new whiteboards to the Inbox.",
                subspace: "Cannot add new subspaces to the Inbox.",
                plugin: "Cannot add new plugins to this space.",
                spreadsheet: "Cannot add new spreadsheets on this space."
            }
        }

        return {}
    }, [accessType, lensId, pathname]);

    useEffect(() => {
        if (!lensId && activeToolbarComponent === "social") closeComponent();
    }, [lensId]);

    const toolbarMobileButton = useMemo(() => {
        return <MantineProvider>
            <Button
                variant="subtle"
                className="h-full w-full"
                onClick={() => {
                    switchComponent("questionform");
                    if (onboardingStep === 1 && !onboardingIsComplete) goToNextOnboardingStep();
                }}
                c="gray.6">
                <NextImage src="/yodeai.png" alt="yodeai" width={22} height={22} />
            </Button>
        </MantineProvider>
    }, []);

    usePortal({
        children: toolbarMobileButton,
        containerSelector: "#toolbar_mobile_button",
    }, [pathname])

    return <AppShell.Aside className="flex !flex-row">
        { /*toolbar buttons*/}
        <Box component='div' className="h-full bg-white">
            <Flex direction="column" gap={5} className="mt-1 p-1">
                <Box>
                    {(onboardingStep === 1 && !onboardingIsComplete)
                        ?
                        <OnboardingPopover
                            width={300}
                            stepToShow={1}
                            position="left-start"
                            popoverContent={
                                <>
                                    <Text size="sm" mb={10}>Within a page or space, you can talk to the Yodeai agent.</Text>
                                    <Text size="sm">Click the <b>Yodeai icon.</b></Text>
                                </>
                            }
                        >
                            <Button
                                variant={activeToolbarComponent === "questionform" ? "light" : "subtle"}
                                onClick={() => {
                                    switchComponent("questionform");
                                    if (onboardingStep === 1 && !onboardingIsComplete) goToNextOnboardingStep();
                                }}
                                c="gray.6">
                                <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                            </Button>
                        </OnboardingPopover>
                        :
                        <Button
                            variant={activeToolbarComponent === "questionform" ? "light" : "subtle"}
                            onClick={() => {
                                switchComponent("questionform");
                                if (onboardingStep === 1 && !onboardingIsComplete) goToNextOnboardingStep();
                            }}
                            c="gray.6">
                            <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                        </Button>
                    }
                </Box>
                <Menu position="left" opened={menuOpened} onChange={setMenuOpened}>
                    <Box>
                        <Menu.Target>
                            {(onboardingStep === 3 && !onboardingIsComplete)
                                ?
                                <OnboardingPopover
                                    width={400}
                                    stepToShow={3}
                                    position="left-start"
                                    popoverContent={
                                        <>
                                            <Text size="sm" mb={10}>Yodeai provides a variety of widgets tailored for specific spaces. Each widget's functionality is designed to complement the content of the open space, ensuring a seamless integration.</Text>
                                            <Text size="sm" mb={10}>Click the <b>+ icon.</b></Text>
                                            <Anchor onClick={() => router.push(`/demos`)} underline='always' c={"black"} size="sm">Click here to learn more about widgets</Anchor>
                                        </>
                                    }
                                >
                                    <Button
                                        variant="subtle"
                                        c="gray.6"
                                        onClick={handlePlusIconClick}
                                    >
                                        <FaPlus size={18} />
                                    </Button>
                                </OnboardingPopover>
                                :
                                <Button
                                    variant="subtle"
                                    c="gray.6"
                                    onClick={handlePlusIconClick}
                                >
                                    <FaPlus size={18} />
                                </Button>
                            }
                        </Menu.Target>
                    </Box>
                    <Menu.Dropdown>
                        <ConditionalTooltip visible={"block" in disabledItems} label={disabledItems.block}>
                            <Link href="/new" className={cn(
                                "no-underline block decoration-transparent text-inherit bg-gray h-full w-full",
                                "block" in disabledItems && "pointer-events-none" || "")}>
                                <Menu.Item disabled={"block" in disabledItems}>
                                    New Page
                                </Menu.Item>
                            </Link>
                        </ConditionalTooltip>
                        <ConditionalTooltip visible={"subspace" in disabledItems} label={disabledItems.subspace}>
                            <Menu.Item disabled={"subspace" in disabledItems} onClick={subspaceModalController.open}>New Space</Menu.Item>
                        </ConditionalTooltip>
                        <ConditionalTooltip visible={"whiteboard" in disabledItems} label={disabledItems.whiteboard}>
                            <Menu.Item disabled={"whiteboard" in disabledItems} onClick={whiteboardModalController.open}>New Whiteboard</Menu.Item>
                        </ConditionalTooltip>
                        <ConditionalTooltip visible={"spreadsheet" in disabledItems} label={disabledItems.spreadsheet}>
                            <Menu.Item disabled={"spreadsheet" in disabledItems} onClick={spreadsheetModalController.open}>New Spreadsheet</Menu.Item>
                        </ConditionalTooltip>
                        <Menu position="left" shadow="md" width={250} trigger="hover">
                            <Menu.Target>
                                <Menu.Item rightSection={<FaAngleRight className="text-gray-400" size={12} />} disabled={"plugin" in disabledItems}>
                                    New Widget
                                </Menu.Item>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={userInsightsModalController.open}>User Insight</Menu.Item>
                                <Menu.Item onClick={competitiveAnalysisModalController.open}>Competitive Analysis</Menu.Item>
                                <Menu.Item onClick={painPointTrackerModalController.open}>Pain Point Tracker</Menu.Item>
                                <Menu.Item onClick={widgetFormController.open}>PRD to Tickets</Menu.Item>
                                <Menu.Item onClick={() => router.push(`/demos`)}>HELP: Widget Tutorials</Menu.Item>
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

        <Box component='div' className="border-l border-l-[#eeeeee] w-full">
            { /* toolbar content with context */}
            <context.Provider value={{
                closeComponent,
                activeToolbarComponent
            }}>
                {activeToolbarComponent === "questionform" && <QuestionAnswerForm />}
                {activeToolbarComponent === "social" && <LensChat />}
            </context.Provider>
        </Box>
    </AppShell.Aside>
}