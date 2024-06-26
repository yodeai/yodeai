"use client";
import React, { useState, FormEvent, useMemo } from 'react';
import apiClient from '@utils/apiClient';
import { useAppContext } from "@contexts/context";
import { useEffect } from "react";
import QuestionComponent from './QuestionComponent';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AppShell, Button, Flex, Group, Image, Text, Textarea } from '@mantine/core';

import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';
import InfoPopover from '@components/InfoPopover';
import ToolbarHeader from '@components/Layout/Aside/ToolbarHeader';
import LoadingSkeleton from '@components/LoadingSkeleton';
import OnboardingPopover from '@components/Onboarding/OnboardingPopover';

type Question = { pageContent: "", metadata: { "1": "", "2": "", "3": string, "4": "", "5": "" } }

const QuestionListComponent: React.FC = () => {
    const { lensId, lensName, activeComponent, user, onboardingStep, onboardingIsComplete, goToNextOnboardingStep } = useAppContext();

    const [questionHistory, setQuestionHistory] = useState<Array<{ question: string, created_at: string; answer: string, sources: { title: string, blockId: string }[] }>>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])

    // useEffect(() => {
    //     const delayDebounceFn = setTimeout(async () => {
    //         try {
    //             if (inputValue) {
    //                 console.log('inputValue', inputValue);
    //                 const dataToPost = { question: inputValue, lens_id: lensId };
    //                 console.log("Making POST request")
    //                 await apiClient('/searchableFeed', 'POST', dataToPost
    //                 ).then((response) => {
    //                     setRelatedQuestions(response.answer.documents)
    //                 });
    //             }
    //         } catch (error) {
    //             console.error('Failed to retrieve searchable feed. ', error);
    //         } finally {
    //         }
    //     }, 2000)

    //     return () => clearTimeout(delayDebounceFn)
    // }, [inputValue]);

    const handleComponentUnmount = () => {
        setQuestionHistory([]);
        setIsLoading(false);
        setIsSubmitting(false);
    }

    useEffect(() => {
        if (onboardingStep === 2 && !onboardingIsComplete) {
            setInputValue('What is Yodeai?');
        }
    }, [onboardingStep]);

    useEffect(() => {
        if (!lensId) {
            handleComponentUnmount();
            return;
        }
        fetchLensQuestions();

        return () => {
            handleComponentUnmount();
        }
    }, [lensId])

    const fetchLensQuestions = useDebouncedCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetch(`/api/lens/${lensId}/questions`, { method: "GET" })
                .then((response) => {
                    return response.json()
                });

            if (!data && data.ok !== true) {
                throw new Error('Failed to retrieve lens questions');
            }
            const QAs = data.data.map((qa) => {
                return {
                    question: qa.question_text,
                    answer: qa.answer_full,
                    created_at: qa.created_at,
                    sources: qa.sources.map(source => ({
                        title: source.title,
                        blockId: source.block_id
                    }))
                }
            });

            setQuestionHistory(QAs);
        } catch (error) {
            console.error('Failed to retrieve searchable feed. ', error);
        } finally {
            setIsLoading(false);
        }
    }, 100, [lensId, questionHistory])

    const updateQuestion = (question: Question, diff: number) => {
        let newRelatedQuestions: Question[] = [...relatedQuestions]
        let indexOfQuestion = newRelatedQuestions.findIndex((q: Question) => q.metadata["3"] === question.metadata["3"])
        question = newRelatedQuestions[indexOfQuestion]
        newRelatedQuestions[indexOfQuestion] = { ...question, metadata: { ...newRelatedQuestions[indexOfQuestion].metadata, "3": question.metadata["3"] + diff } }
        setRelatedQuestions(newRelatedQuestions);
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const startTime = performance.now();

        try {
            const supabase = createClientComponentClient()
            console.log("asking a question")
            // we CANNOT pass a null lensId to the backend server (python cannot accept it)
            const dataToPost = {
                question: inputValue,
                lensID: lensId ? lensId : "NONE",
                activeComponent: activeComponent,
                userID: user.id,
                published: false,
                google_user_id: user.user_metadata?.google_user_id ? user.user_metadata?.google_user_id : "NONE"
            };
            const response = await apiClient('/answerFromLens', 'POST', dataToPost);
            let blockTitles: { title: string, blockId: string }[] = [];
            if (response && response.answer) {
                blockTitles = await Promise.all(
                    (response.metadata.blocks || []).map(async (blockId: string) => {
                        try {
                            const blockResponse = await fetch(`/api/block/${blockId}`);
                            if (!blockResponse.ok) throw new Error('Failed to fetch page title');
                            const blockData = await blockResponse.json();

                            if (!blockData.ok) throw new Error('Failed to retrieve valid page data');

                            return { title: blockData.data.title, blockId }; // Store title and blockId
                        } catch (error) {
                            console.error("Error fetching page title:", error);
                            return { title: 'Unknown Source', blockId };
                        }
                    })
                );
            }

            if (onboardingStep === 2 && !onboardingIsComplete) goToNextOnboardingStep();

            setQuestionHistory((prevQuestionHistory) => {
                if (response && response.answer) {
                    const newQA = { question: inputValue, answer: response.answer, sources: blockTitles, created_at: new Date().toISOString() };
                    return [newQA, ...prevQuestionHistory]
                } else {
                    const newQA = { question: inputValue, answer: 'Failed to fetch answer. No answer in response.', sources: [], created_at: new Date().toISOString() };
                    return [newQA, ...prevQuestionHistory]
                }
            });

        } catch (error: any) {
            console.error('Failed to fetch answer.', error);

            setQuestionHistory((prevQuestionHistory) => {
                const errorQA = { question: inputValue, answer: `Failed to fetch answer. ${error}`, sources: [], created_at: new Date().toISOString() }
                return [errorQA, ...prevQuestionHistory,]
            });
        } finally {
            const endTime = performance.now(); // Capture end time
            const duration = endTime - startTime; // Calculate the duration
            console.log(`Time to get the answer: ${duration.toFixed(2)} ms`);
            setInputValue('');
            setIsSubmitting(false);
        }
    }

    const infoText = useMemo(() => {
        const defaultText = "using the data in your pages.";
        return `Ask a question and Yodeai will respond to it ${lensName ? `based on the pages in the space "${lensName}".` : defaultText}`
    }, [lensName, lensId]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    }

    return (
        <Flex
            direction={"column"}
            className="h-full w-full"
            justify={"space-between"}>

            {/*toolbar header  */}
            <AppShell.Section>
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
                        <InfoPopover infoText={infoText} />
                    </Flex>
                </ToolbarHeader>
            </AppShell.Section>

            {/* toolbar content */}
            <div className="grow px-3 pt-3 flex gap-3 flex-col-reverse overflow-scroll">
                {!isLoading && questionHistory.length === 0 && (
                    <span className="text-center text-gray-400 text-sm">
                        No questions yet. Ask a question to get started.
                    </span>
                )}
                {isLoading && (<LoadingSkeleton boxCount={8} lineHeight={80} />)}
                {questionHistory.map(({ question, answer, created_at, sources }, index) => (
                    <QuestionComponent
                        created_at={created_at}
                        lensID={lensId}
                        id={null}
                        key={index}
                        question={question}
                        answer={answer}
                        sources={sources}
                        published={false}
                    />
                ))}
            </div>

            {/* toolbar footer */}
            <AppShell.Section>
                <Flex p={10} pt={0} direction={"column"}>
                    <Flex justify={'center'} pb={0} direction={"column"}>
                        {(
                            <form onSubmit={handleSubmit} style={{ flexDirection: 'column' }} className="flex">
                                {(onboardingStep === 2 && !onboardingIsComplete)
                                    ?
                                    <OnboardingPopover
                                        width={400}
                                        stepToShow={2}
                                        position="left-start"
                                        popoverContent={
                                            <>
                                                <Text size="sm" mb={10}>The Yodeai agent can answer questions, generate summaries, and more.</Text>
                                                <Text size="sm">Ask a question, like <b>"What is Yodeai?"</b></Text>
                                            </>
                                        }
                                    >
                                        <Textarea
                                            onKeyDown={handleKeyDown}
                                            disabled={isSubmitting}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="Enter your question"
                                        />
                                    </OnboardingPopover>
                                    :
                                    <Textarea
                                        onKeyDown={handleKeyDown}
                                        disabled={isSubmitting}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Enter your question"
                                    />
                                }
                                <Group justify="flex-end" mt="xs">
                                    <Button style={{ height: 24, width: '100%' }} size='xs' type="submit" variant='gradient' gradient={{ from: 'orange', to: '#FF9D02', deg: 250 }} disabled={isSubmitting}>
                                        <Image color='blue' src="../../yodebird.png" alt="Icon" style={{ height: '1em', marginRight: '0.5em' }} />
                                        {isSubmitting ? 'Asking...' : 'Ask'}
                                    </Button>
                                </Group>
                            </form>
                        )}
                    </Flex>
                </Flex>
            </AppShell.Section>
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
        </Flex >
    );
};

export default QuestionListComponent;
