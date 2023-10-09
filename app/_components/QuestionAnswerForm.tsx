// components/QuestionAnswerForm.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import apiClient from '@utils/apiClient';
import { useLens } from "@contexts/lensContext";
import { useRef, useEffect } from "react";
import { clearConsole } from 'debug/tools';
import QuestionComponent from './QuestionComponent';
import { getUserID } from 'utils/getUserID';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';





const QuestionAnswerForm: React.FC = () => {
    const [questionHistory, setQuestionHistory] = useState<Map<string, Array<{ question: string, answer: string, sources: { title: string, blockId: string }[] }>>>(new Map());


    const [inputValue, setInputValue] = useState<string>('');
    const { lensId, lensName } = useLens();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scrollableDivRef = useRef<HTMLDivElement | null>(null);

    
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
            
            const dataToPost = { question: inputValue, lensID: lensId?lensId:"NONE", userID: data.user?.id };            
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
                const previousQAs = newQuestionHistory.get(lensId?lensId:"") || []; // Get the existing array of Q&A for the lens_id or an empty array

                if (response && response.answer) {
                    const newQA = { question: inputValue, answer: response.answer, sources: blockTitles };
                    previousQAs.unshift(newQA);
                    newQuestionHistory.set(lensId?lensId:"", previousQAs);
                } else {
                    const newQA = { question: inputValue, answer: 'Failed to fetch answer. No answer in response.', sources: [] };
                    previousQAs.push(newQA);
                    newQuestionHistory.set(lensId?lensId:"", previousQAs);
                }

                return newQuestionHistory;
            });

        } catch (error: any) {
            console.error('Failed to fetch answer.', error);

            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory);
                const previousQAs = newQuestionHistory.get(lensId?lensId:"") || [];
                const errorQA = { question: inputValue, answer: `Failed to fetch answer. ${error}`, sources: [] };
                previousQAs.push(errorQA);
                newQuestionHistory.set(lensId?lensId:"", previousQAs);
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
                {lensId ? 'Ask a question from this lens' : 'Ask a question from your data'}
            </h1>

            
            <div className="flex flex-col  lg:py-12 text-foreground">
            { (
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
                        (questionHistory.get(lensId?lensId:"") || []).map(({ question, answer, sources }, index) => (
                            <QuestionComponent
                                key={index}
                                question={question}
                                answer={answer}
                                sources={sources}
                            />
                        ))

                    }
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswerForm;
