// The purpose of this page is to demonstrate how to fetch data from the backend and also to test the backend is working.

import React from 'react';
import Link from 'next/link';
import fetchData from '../utils/apiClient';

interface AnswerProps {
  answer: string;
}

const AnswerPage: React.FC<AnswerProps> = ({ answer }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl mb-4">Answer from FastAPI:</h1>
      <p className="text-lg">{answer}</p>
      <Link href="/">
        <span className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Back to Home</span>
      </Link>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const dataToPost = { input_string: "Hello?" };  
    const response = await fetchData('/api/echo', {
      method: 'POST',
      body: JSON.stringify(dataToPost),
    });

    return {
      props: {
        answer: response.result
      }
    };
  } catch (error) {
    console.error('Failed to fetch echo:', error);
    return {
      props: {
        answer: 'Failed to fetch echo. ' + error + " " + process.env.API_URL
      }
    };
  }
}
export default AnswerPage;
