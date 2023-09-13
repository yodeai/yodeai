// components/QuestionAnswerForm.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import { useLens } from "@contexts/lensContext";
import fetchData from '../_utils/apiClient';
import ReactMarkdown from 'react-markdown';


const chatHistory = new Map();

import styled from 'styled-components';

import { useRef, useEffect } from "react";


  


const QuestionAnswerForm: React.FC = () => {
    const scrollableDivRef = useRef<HTMLDivElement | null>(null);


    const [inputValue, setInputValue] = useState<string>('');
    const lensID='7';
    if (chatHistory.has(lensID) === false)
        chatHistory.set(lensID,'');

    const [slug, setSlug] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { lensId, setLensId } = useLens();
    const handleSubmit = async (e: FormEvent) => {
        console.log('\n\n\n-----------\n\n\n');
        e.preventDefault();
        setIsLoading(true);
        
        try {
            console.log('inputValue', inputValue);
            const dataToPost = { question: inputValue };
            const response = await fetchData('/answerQuestion', {
                method: 'POST',
                body: JSON.stringify(dataToPost),
            });

            setAnswer(response.answer_full);
            setSlug(response.slug);

        } catch (error) {
            console.error('Failed to fetch answer. ', error);
            const newResponse=chatHistory.get(lensID)+'Failed to fetch answer. ' + error;
            chatHistory.set(lensID, newResponse);            
        } finally {
            setIsLoading(false);
        }
        setTimeout(() => {
            if (scrollableDivRef.current) {
                scrollableDivRef.current.scrollTop = 0;
//              scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
            }
          }, 0);
    }

    
    const answer = chatHistory.has(lensID)?chatHistory.get(lensID):'The answer will be limited to the content of the lens.';
    
    return (
        <div className="container p-4 " >
            <h1 className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">Ask questions:</h1>
            <p>LensID: {lensId}</p>
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
                <div className="scrollable-div" 
                    style={{ maxHeight: '200px' , overflowY: 'auto'}} 
                    id="ChatBox"
                    ref={scrollableDivRef}>
                    <ReactMarkdown className=" mt-4">{answer}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default QuestionAnswerForm;
