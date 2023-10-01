// components/QuestionAnswerForm.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import apiClient from '@utils/apiClient';
import { useLens } from "@contexts/lensContext";
import { useRef, useEffect } from "react";
import { clearConsole } from 'debug/tools';
import QuestionComponent from './QuestionComponent';
type Question = {pageContent: "", metadata: {"1": "", "2":"", "3": "", "4": "", "5":""}}



const QuestionAnswerForm: React.FC = () => {
    const [questionHistory, setQuestionHistory] = useState<Map<string, Array<{ question: string, answer: string, sources: { title: string, blockId: string }[] }>>>(new Map());
    const [inputValue, setInputValue] = useState<string>('');
    const { lensId, setLensId } = useLens();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scrollableDivRef = useRef<HTMLDivElement | null>(null);
    const [relatedQuestions, setRelatedQuestions] = useState<[]>([])

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
          try {
            if (inputValue) {
                console.log('inputValue', inputValue);
                const url = `/searchableFeed/${inputValue}`;
                const tparams = new URLSearchParams({ question: inputValue }).toString(); 
                console.log("Making GET request")
                await apiClient(`${url}?${tparams}`, 'GET'
                ).then((response) => {
                    setRelatedQuestions(response.answer.documents)
                });
            }
            } catch (error) {
                console.error('Failed to retrieve searchable feed. ', error);
            } finally {
            }
        }, 200)
    
        return () => clearTimeout(delayDebounceFn)
      }, [inputValue])


    const makePatchRequest = async (q: Question, id: string, diff:number) => {
        let url;
        if (diff > 0) {
            url = `/increasePopularity/${id}`
        } else {
            url = `/decreasePopularity/${id}`
        }
        try {
            console.log('id', id, "diff", diff);
            console.log("Making patch request")
            const response = await apiClient(url, 'PATCH')
            console.log("error?")
            if(response.error == null){
                updateQuestion(q, diff);
            }

        } catch (error) {
            console.error('Failed to increase answer. ', error);
        } finally {
        }
    }
    const updateQuestion = (question: Question, diff:number) => {
        let newRelatedQuestions: Question[] = [...relatedQuestions]
        let indexOfQuestion = newRelatedQuestions.findIndex((q:Question) => q.metadata["3"] === question.metadata["3"])
        question = newRelatedQuestions[indexOfQuestion]
        newRelatedQuestions[indexOfQuestion] = {...question, metadata: {...newRelatedQuestions[indexOfQuestion].metadata, "3": question.metadata["3"] + diff}}
        setRelatedQuestions(newRelatedQuestions);
    }
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const startTime = performance.now();
        try {
            const dataToPost = { question: inputValue, lensID: lensId };
            //console.log('dataToPost', dataToPost)
            const response = await apiClient('/answerFromLens', 'POST', dataToPost);
            //console.log('response', response)

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
                const previousQAs = newQuestionHistory.get(lensId || '') || []; // Get the existing array of Q&A for the lens_id or an empty array

                if (response && response.answer) {
                    const newQA = { question: inputValue, answer: response.answer, sources: blockTitles };
                    previousQAs.unshift(newQA);
                    newQuestionHistory.set(lensId || '', previousQAs);
                } else {
                    const newQA = { question: inputValue, answer: 'Failed to fetch answer. No answer in response.', sources: [] };
                    previousQAs.push(newQA);
                    newQuestionHistory.set(lensId || '', previousQAs);
                }

                return newQuestionHistory;
            });

        } catch (error: any) {
            console.error('Failed to fetch answer.', error);

            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory);
                const previousQAs = newQuestionHistory.get(lensId || '') || [];
                const errorQA = { question: inputValue, answer: `Failed to fetch answer. ${error}`, sources: [] };
                previousQAs.push(errorQA);
                newQuestionHistory.set(lensId || '', previousQAs);
                return newQuestionHistory;
            });
        } finally {
            const endTime = performance.now(); // Capture end time
            const duration = endTime - startTime; // Calculate the duration
            console.log(`Time to get the answer: ${duration.toFixed(2)} ms`);
            setIsLoading(false);
        }
    }


    return (
        <div className="container p-4 " >
            <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">
                {lensId ? 'Ask a question from this lens' : 'Select a lens to ask a question'}
            </h1>

            
            <div className="flex flex-col  lg:py-12 text-foreground">
            {lensId && (
                <form onSubmit={handleSubmit} className="flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter your question"
                        className="text-black mr-2 w-full h-12 px-4 "
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-btn-background  py-2 px-4 rounded"
                    >
                        {isLoading ? 'Loading...' : 'Submit'}
                    </button>
                </form>
            )}
                <div className="scrollable-div mt-4" ref={scrollableDivRef}>
                    {
                        (questionHistory.get(lensId || '') || []).map(({ question, answer, sources }, index) => (
                            <QuestionComponent
                                key={index}
                                question={question}
                                answer={answer}
                                sources={sources}
                            />
                        ))

                    }
                </div>
                <div>
                <br></br>
                <h1> Related Questions </h1>
                {relatedQuestions?.map(q => <div key={q.metadata["5"]}> <br></br><div>{q.pageContent}</div><div>Popularity: {q.metadata["3"]}</div> <div> {q.metadata["1"]} </div> <button onClick={() => {makePatchRequest(q, q.metadata["5"], 1)}}> Thumbs up </button>  <button onClick={() => {makePatchRequest(q, q.metadata["5"], -1)}}> Thumbs Down </button> </div>)}
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswerForm;
