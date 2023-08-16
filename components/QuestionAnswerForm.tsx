// components/QuestionAnswerForm.tsx
"use client";
import React, { useState, FormEvent } from 'react';
import fetchData from '../utils/apiClient';

const QuestionAnswerForm: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [answer, setAnswer] = useState<string>('For instance, you can ask: What types of courses do I need to take in the first year? What credits could I transfer from high school? ');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const dataToPost = { question: inputValue };
            const response = await fetchData('/api/vectorSearch', {
                method: 'POST',
                body: JSON.stringify(dataToPost),
              });
              
            setAnswer(response.text);
        } catch (error) {
            console.error('Failed to fetch answer. ', error);
            setAnswer('Failed to fetch answer. ' + error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4" >
            <h1 className="text-xl mb-4">Ask anything about UC, Berkeley:</h1>
            <form onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter your question"
                    className="text-black mr-2"
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-btn-background font-bold py-2 px-4 rounded"
                >
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
            </form>
            <p className="text-lg mt-4">{answer}</p>
        </div>
    );
};

export default QuestionAnswerForm;
