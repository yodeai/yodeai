'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { Box, Flex, Button, Menu, Text, Anchor } from '@mantine/core';
import NextImage from 'next/image';
import { HiDocumentText } from "react-icons/hi2";
import { BiSolidWidget } from "react-icons/bi";
import { FaSitemap } from "react-icons/fa";
import { BiSolidNotepad } from "react-icons/bi";

import { useAppContext } from '@contexts/context';
import { cn } from '@utils/style';
import Link from 'next/link';

import ConditionalTooltip from './ConditionalTooltip';
import LensChat from './LensChat';
import { getActiveToolbarTab, setActiveToolbarTab } from '@utils/localStorage';
import { usePathname, useRouter } from 'next/navigation';
import OnboardingPopover from './Onboarding/OnboardingPopover';
import NotesSection from './NotesSection';

type contextType = {
    activeToolbarComponent: "social" | "questionform" | "notes";
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
        painPointTrackerModalDisclosure, widgetFormDisclosure
    } = useAppContext();

    const [subspaceModalState, subspaceModalController] = subspaceModalDisclosure;
    const [whiteboardModalState, whiteboardModalController] = whiteboardModelDisclosure;
    const [userInsightsModalState, userInsightsModalController] = userInsightsDisclosure;
    const [competitiveAnalysisModalState, competitiveAnalysisModalController] = competitiveAnalysisDisclosure;
    const [spreadsheetModalState, spreadsheetModalController] = spreadsheetModalDisclosure;
    const [painPointTrackerModalState, painPointTrackerModalController] = painPointTrackerModalDisclosure;
    const [widgetFormState, widgetFormController] = widgetFormDisclosure;

    const [menuOpened, setMenuOpened] = useState(false);
    const [widgetMenuOpened, setWidgetsMenuOpened] = useState(false);

    const handlePlusIconClick = () => {
        setMenuOpened(true);
    };

    const handleWidgetIconClick = () => {
        if (onboardingStep === 5 && !onboardingIsComplete) {
            goToNextOnboardingStep();
        }
        setWidgetsMenuOpened(true);
    };

    const closeComponent = () => {
        setActiveToolbarComponent(null);
    }

    const switchComponent = (component: contextType["activeToolbarComponent"]) => {
        if (activeToolbarComponent === component) return closeComponent();
        setActiveToolbarComponent(component);
    }

    const handleNotesIconClick = () => {
        setActiveToolbarComponent("notes");
        if (onboardingStep === 4 && !onboardingIsComplete) {
            goToNextOnboardingStep();
        }
    };

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
    }, [lensId])

    return <Flex direction="row" className="h-[calc(100vh-60px)] w-full z-50">
        { /*toolbar buttons*/}
        <Box component='div' className="h-full bg-white border-l border-l-[#eeeeee]">
            <Flex direction="column" gap={5} className="mt-1 p-1">
                <Box>
                    {(onboardingStep === 2 && !onboardingIsComplete)
                        ?
                        <OnboardingPopover
                            width={300}
                            stepToShow={2}
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
                                    if (onboardingStep === 2 && !onboardingIsComplete) goToNextOnboardingStep();
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
                                if (onboardingStep === 2 && !onboardingIsComplete) goToNextOnboardingStep();
                            }}
                            c="gray.6">
                            <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                        </Button>
                    }
                </Box>
                <Menu position="left" opened={widgetMenuOpened} onChange={setWidgetsMenuOpened}>
                    <Box>
                        <Menu.Target>
                            {(onboardingStep === 5 && !onboardingIsComplete)
                                ?
                                <OnboardingPopover
                                    width={400}
                                    stepToShow={5}
                                    position="left-start"
                                    popoverContent={
                                        <>
                                            <Text size="sm" mb={10}>Yodeai provides a variety of widgets tailored for specific spaces. Each widget's functionality is designed to complement the content of the open space, ensuring a seamless integration.</Text>
                                            <Text size="sm" mb={10}>Click the <b>widgets icon.</b></Text>
                                            <Anchor onClick={() => router.push(`/demos`)} underline='always' c={"black"} size="sm">Click here to learn more about widgets</Anchor>
                                        </>
                                    }
                                >
                                    <Button
                                        variant="subtle"
                                        c="gray.6"
                                        onClick={handleWidgetIconClick}
                                    >
                                        <FaSitemap size={18} />
                                    </Button>
                                </OnboardingPopover>
                                :
                                <Button
                                    variant="subtle"
                                    c="gray.6"
                                    onClick={handleWidgetIconClick}
                                >
                                    <FaSitemap size={18} />
                                </Button>
                            }
                        </Menu.Target>
                    </Box>
                    <Menu.Dropdown>
                        <Menu.Item onClick={userInsightsModalController.open}>User Insights Analyzer</Menu.Item>
                        <Menu.Item onClick={painPointTrackerModalController.open}>Pain Points Tracker</Menu.Item>
                        <Menu.Item onClick={() => router.push(`/demos`)}>HELP: Widget Tutorials</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
                <Box>
                    {(onboardingStep === 4 && !onboardingIsComplete)
                        ?
                        <OnboardingPopover
                            width={400}
                            stepToShow={4}
                            position="left-start"
                            popoverContent={
                                <>
                                    <Text size="sm" mb={10}>Yodeai provides a notepad where you can jot down notes and keep track your thoughts. This notepad is universal and contains the same information regardless of what page or space you're in.</Text>
                                    <Text size="sm">Click the <b>notepad icon.</b></Text>
                                </>
                            }
                        >
                            <Button
                                variant={activeToolbarComponent === "notes" ? "light" : "subtle"}
                                c="gray.6"
                                onClick={() => handleNotesIconClick()}
                            >
                                <BiSolidNotepad size={18} />
                            </Button>
                        </OnboardingPopover>
                        :
                        <Button
                            variant={activeToolbarComponent === "notes" ? "light" : "subtle"}
                            c="gray.6"
                            onClick={switchComponent.bind(null, "notes")}>
                            <BiSolidNotepad size={18} />
                        </Button>
                    }
                </Box>
            </Flex>
        </Box >
        <Box component='div' className={cn("bg-white border-l border-l-[#eeeeee]", activeToolbarComponent ? "min-w-[500px] max-w-[500px]" : "w-[0px]")}>
            { /* toolbar content with context */}
            <context.Provider value={{
                closeComponent,
                activeToolbarComponent
            }}>
                {activeToolbarComponent === "questionform" && <QuestionAnswerForm />}
                {activeToolbarComponent === "social" && <LensChat />}
                {activeToolbarComponent === "notes" && <NotesSection />}
            </context.Provider>
        </Box>
    </Flex >
}