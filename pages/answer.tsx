import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import fetchData from '../utils/apiClient';

const AnswerPage: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(''); // For input from text box
  const [answer, setAnswer] = useState<string>('Enter a question and press submit!'); // For answer from API

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const dataToPost = { input_string: inputValue };  
      const response = await fetchData('api/echo', {
        method: 'POST',
        body: JSON.stringify(dataToPost),
      });
      
      setAnswer(response.result);
    } catch (error) {
      console.error('Failed to fetch echo:', error);
      setAnswer('Failed to fetch echo.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl mb-4">Answer from FastAPI:</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Enter your question" 
        />
        <button type="submit">Submit</button>
      </form>
      <p className="text-lg mt-4">{answer}</p>
      <Link href="/">
        <span className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Back to Home</span>
      </Link>
    </div>
  );
};

export default AnswerPage;
