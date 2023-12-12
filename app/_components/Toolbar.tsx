'use client';

import React, { useState, createContext, useContext } from 'react';
import QuestionAnswerForm from '@components/QuestionAnswerForm'
import { Box, Flex, Button } from '@mantine/core';
import { FaInfo, FaPlus } from 'react-icons/fa';
import NextImage from 'next/image';
import { IoIosChatbubbles } from 'react-icons/io';
import { FaHand } from 'react-icons/fa6';

type contextType = {
    activeComponent: "social" | "questionform";
    closeComponent: () => void;
};

const defaultValue: contextType = {
    activeComponent: "questionform",
    closeComponent: () => { },
}

const context = createContext<contextType>(defaultValue);

export const useToolbarContext = () => {
    return useContext(context);
};

export default function Toolbar() {
    const [activeComponent, setActiveComponent] = useState<"social" | "questionform">(defaultValue.activeComponent);

    const closeComponent = () => {
        setActiveComponent(null);
    }

    return <Flex direction="row" className="h-[calc(100vh-60px)] sticky top-0">
        { /*toolbar buttons*/}
        <Box component='div' className="h-full bg-white border-l border-l-[#eeeeee]">
            <Flex direction="column" gap={5} className="mt-1 p-1">
                <Box>
                    <Button variant="subtle" onClick={() => setActiveComponent("questionform")}>
                        <NextImage src="/yodeai.png" alt="yodeai" width={18} height={18} />
                    </Button>
                </Box>
                <Box>
                    <Button variant="subtle" c="gray.6">
                        <FaPlus size={18} />
                    </Button>
                </Box>
                <Box>
                    <Button variant="subtle" c="gray.6">
                        <IoIosChatbubbles size={18} />
                    </Button>
                </Box>
                <Box>
                    <Button variant="subtle" c="gray.6">
                        <FaHand size={18} />
                    </Button>
                </Box>
                <Box>
                    <Button variant="subtle" c="gray.6">
                        <FaInfo size={18} />
                    </Button>
                </Box>
            </Flex>
        </Box>
        <Box component='div' className={`${!activeComponent ? "w-[0px]" : "w-[20vw]"}`}>
            { /* toolbar content with context */}
            <context.Provider value={{
                closeComponent,
                activeComponent
            }}>
                {activeComponent === "questionform" && <QuestionAnswerForm />}
            </context.Provider>
        </Box>
    </Flex>
}