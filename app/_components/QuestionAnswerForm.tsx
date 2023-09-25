// components/QuestionAnswerForm.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import apiClient from '@utils/apiClient';
import { useLens } from "@contexts/lensContext";
import { useRef, useEffect } from "react";
import { clearConsole } from 'debug/tools';
import QuestionComponent from './QuestionComponent';



const QuestionAnswerForm: React.FC = () => {
    const [questionHistory, setQuestionHistory] = useState<Map<string, Array<{ question: string, answer: string }>>>(new Map());
    const [inputValue, setInputValue] = useState<string>('');
    const { lensId, setLensId } = useLens();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const scrollableDivRef = useRef<HTMLDivElement | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToPost = { question: inputValue, lensID: lensId };
            console.log('dataToPost', dataToPost)
            const response = await apiClient('/answerFromLens', 'POST', dataToPost);
            console.log('response', response)
            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory); // Create a new Map from previous state
                const previousQAs = newQuestionHistory.get(lensId || '') || []; // Get the existing array of Q&A for the lens_id or an empty array

                if (response && response.answer) {
                    // Create a new question-answer pair and add it to the array
                    const newQA = { question: inputValue, answer: response.answer };
                    previousQAs.unshift(newQA);

                    // Update the map with the updated array of Q&A
                    newQuestionHistory.set(lensId || '', previousQAs);
                } else {
                    // In case of no answer in the response, you can push an error object to the array or handle it differently depending on your needs
                    const newQA = { question: inputValue, answer: 'Failed to fetch answer. No answer in response.' };
                    previousQAs.push(newQA);

                    // Update the map with the updated array of Q&A
                    newQuestionHistory.set(lensId || '', previousQAs);
                }

                return newQuestionHistory;
            });

        } catch (error: any) {
            console.error('Failed to fetch answer.', error);

            setQuestionHistory((prevQuestionHistory) => {
                const newQuestionHistory = new Map(prevQuestionHistory);
                const previousQAs = newQuestionHistory.get(lensId || '') || [];

                // Create an error object and push it to the array
                const errorQA = { question: inputValue, answer: `Failed to fetch answer. ${error}` };
                previousQAs.push(errorQA);

                // Update the map with the updated array of Q&A
                newQuestionHistory.set(lensId || '', previousQAs);
                return newQuestionHistory;
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container p-4 " >
            <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">
                {lensId ? 'Ask a question from this lens' : 'Ask a question globally'}
            </h1>

            <div className="flex flex-col  lg:py-12 text-foreground">
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
                <div className="scrollable-div mt-4" ref={scrollableDivRef}>
                    {
                        questionHistory.has(lensId || '') ? (
                            (questionHistory.get(lensId || '') || []).map(({ question, answer }, index) => (
                                <QuestionComponent key={index} question={question} answer={answer} />
                            ))
                        ) : (
                            <p>The answer will be limited to the content of the lens.</p>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswerForm;
