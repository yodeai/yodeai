"use client";
import React, { useState, FormEvent } from 'react';
import apiClient from '@utils/apiClient';
import { useAppContext } from "@contexts/context";
import { useRef, useEffect } from "react";
import { clearConsole } from 'debug/tools';
import QuestionComponent from './QuestionComponent';
import { getUserID } from 'utils/getUserID';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Box, Button, Divider, Flex, Group, Image, ScrollArea, Text, Textarea } from '@mantine/core';
import InfoPopover from './InfoPopover';
import { useForm } from '@mantine/form';
import ToolbarHeader from './ToolbarHeader';

type Question = { pageContent: "", metadata: { "1": "", "2": "", "3": string, "4": "", "5": "" } }

const QuestionAnswerForm: React.FC = () => {
    const [questionHistory, setQuestionHistory] = useState<Map<string, Array<{ question: string, answer: string, sources: { title: string, blockId: string }[] }>>>(new Map());
    const [inputValue, setInputValue] = useState<string>('');
    const { lensId, lensName, activeComponent } = useAppContext();
    const mapKey = activeComponent + lensId;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scrollableDivRef = useRef<HTMLDivElement | null>(null);
    const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])

    // useEffect(() => {
    //     const delayDebounceFn = setTimeout(async () => {
    //       try {
    //         if (inputValue) {
    //             console.log('inputValue', inputValue);
    //             const dataToPost = { question: inputValue, lens_id: lensId };
    //             console.log("Making POST request")
    //             await apiClient('/searchableFeed', 'POST', dataToPost
    //             ).then((response) => {
    //                 setRelatedQuestions(response.answer.documents)
    //             });
    //         }
    //         } catch (error) {
    //             console.error('Failed to retrieve searchable feed. ', error);
    //         } finally {
    //         }
    //     }, 2000)

    //     return () => clearTimeout(delayDebounceFn)
    //   }, [inputValue])


    const makePatchRequest = async (q: Question, id: string, diff: number) => {
        let url;
        if (diff > 0) {
            url = `/increasePopularity`
        } else {
            url = `/decreasePopularity`
        }
        try {
            const dataToPatch = { row_id: id, lens_id: lensId };
            const response = await apiClient(url, 'PATCH', dataToPatch)
            console.log("error?")
            if (response.error == null) {
                updateQuestion(q, diff);
            }

        } catch (error) {
            console.error('Failed to increase answer. ', error);
        } finally {
        }
    }
    const updateQuestion = (question: Question, diff: number) => {
        let newRelatedQuestions: Question[] = [...relatedQuestions]
        let indexOfQuestion = newRelatedQuestions.findIndex((q: Question) => q.metadata["3"] === question.metadata["3"])
        question = newRelatedQuestions[indexOfQuestion]
        newRelatedQuestions[indexOfQuestion] = { ...question, metadata: { ...newRelatedQuestions[indexOfQuestion].metadata, "3": question.metadata["3"] + diff } }
        setRelatedQuestions(newRelatedQuestions);
    }
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const startTime = performance.now();

        try {

            const supabase = createClientComponentClient()

            let { data, error } = await supabase.auth.getUser();
            if (error) {
                throw error;
            }

            // we CANNOT pass a null lensId to the backend server (python cannot accept it)
            const dataToPost = { question: inputValue, lensID: lensId ? lensId : "NONE", activeComponent: activeComponent, userID: data.user.id, published: false };
            const response = await apiClient('/answerFromLens', 'POST', dataToPost);
            let blockTitles: { title: string, blockId: string }[] = [];
            if (response && response.answer) {
                blockTitles = await Promise.all(
                    (response.metadata.blocks || []).map(async (blockId: string) => {
                        try {
                            const blockResponse = await fetch(`/api/block/${blockId}`);
                            if (!blockResponse.ok) throw new Error('Failed to fetch block title');
                            const blockData = await blockResponse.json();

                            if (!blockData.ok) throw new Error('Failed to retrieve valid block data');

                            return { title: blockData.data.title, blockId }; // Store title and blockId
                        } catch (error) {
                            console.error("Error fetching block title:", error);
                            return { title: 'Unknown Source', blockId };
                        }
                    })
                );
            }



            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory); // Create a new Map from previous state
                const previousQAs = newQuestionHistory.get(mapKey) || []; // Get the existing array of Q&A for the lens_id or an empty array

                if (response && response.answer) {
                    const newQA = { question: inputValue, answer: response.answer, sources: blockTitles };
                    previousQAs.unshift(newQA);
                    newQuestionHistory.set(mapKey, previousQAs);
                } else {
                    const newQA = { question: inputValue, answer: 'Failed to fetch answer. No answer in response.', sources: [] };
                    previousQAs.push(newQA);
                    newQuestionHistory.set(mapKey, previousQAs);
                }

                return newQuestionHistory;
            });

        } catch (error: any) {
            console.error('Failed to fetch answer.', error);

            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory);
                const previousQAs = newQuestionHistory.get(mapKey) || [];
                const errorQA = { question: inputValue, answer: `Failed to fetch answer. ${error}`, sources: [] };
                previousQAs.push(errorQA);
                newQuestionHistory.set(mapKey, previousQAs);

                return newQuestionHistory;
            });
        } finally {
            const endTime = performance.now(); // Capture end time
            const duration = endTime - startTime; // Calculate the duration
            console.log(`Time to get the answer: ${duration.toFixed(2)} ms`);
            setInputValue('');
            setIsLoading(false);
        }
    }

    const form = useForm({
        initialValues: {
            email: '',
            termsOfService: false,
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const viewport = useRef<HTMLDivElement>(null);
    const scrollToBottom = () =>
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });

    useEffect(() => {
        scrollToBottom();
    }, [questionHistory]);

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}>
            <Box>
                <ToolbarHeader>
                    <Flex align="center" direction="row">
                        <Text size="sm">
                            {lensId && lensName ?
                                'Context: ' + lensName
                                :
                                ((activeComponent === "global") ?
                                    "Ask a question "
                                    :
                                    "Ask a question")
                            }
                        </Text>
                        <InfoPopover infoText={"Ask a question and Yodeai will respond to it using the data in your blocks."} />
                    </Flex>
                </ToolbarHeader>

                <ScrollArea.Autosize p={10} pt={0} pb={0} mah={'70vh'} scrollbarSize={0} type='auto' viewportRef={viewport}>
                    {
                        (questionHistory.get(mapKey) || []).slice().reverse().map(({ question, answer, sources }, index) => (
                            <QuestionComponent
                                lensID={lensId}
                                id={null}
                                key={index}
                                question={question}
                                answer={answer}
                                sources={sources}
                                published={false}
                            />
                        ))

                    }
                </ScrollArea.Autosize>

                <Divider color={"#eee"} />
            </Box>
            <Box>
                <Flex p={10} pt={0} direction={"column"}>
                    <Flex justify={'center'} pt={10} pb={0} direction={"column"}>
                        {(
                            <form onSubmit={handleSubmit} style={{ flexDirection: 'column' }} className="flex">
                                <Textarea
                                    disabled={isLoading}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Enter your question"
                                />
                                <Group justify="flex-end" mt="xs">
                                    <Button style={{ height: 24, width: '100%' }} size='xs' type="submit" variant='gradient' gradient={{ from: 'orange', to: '#FF9D02', deg: 250 }} disabled={isLoading}>
                                        <Image color='blue' src="../../yodebird.png" alt="Icon" style={{ height: '1em', marginRight: '0.5em' }} />
                                        {isLoading ? 'Loading...' : 'Ask'}
                                    </Button>
                                </Group>
                            </form>
                        )}
                    </Flex>
                </Flex>
            </Box>
            {/* 
                <form onSubmit={form.onSubmit((values) => console.log(values))}>
                    <TextInput
                        withAsterisk
                        label="Email"
                        placeholder="your@email.com"
                        {...form.getInputProps('email')}
                    />

                    <Checkbox
                        mt="md"
                        label="I agree to sell my privacy"
                        {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form> */}

            {/* <div>
                <br></br>
                <h1> Related Questions </h1>
                {relatedQuestions?.map(q => <div key={q.metadata["5"]}> <br></br><div>{q.pageContent}</div><div>Popularity: {q.metadata["3"]}</div> <div> {q.metadata["1"]} </div> <button onClick={() => {makePatchRequest(q, q.metadata["5"], 1)}}> Thumbs up </button>  <button onClick={() => {makePatchRequest(q, q.metadata["5"], -1)}}> Thumbs Down </button> </div>)}
                </div> */}
        </Flex>
    );
};

export default QuestionAnswerForm;
