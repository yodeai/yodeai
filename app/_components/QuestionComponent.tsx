// components/QuestionComponent.tsx
"use client";
import React, {useState, useEffect} from 'react';
import clsx from "clsx";
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface QuestionProps {
  id: string;
  question: string;
  answer: string;
  sources: { title: string; blockId: string }[];
  published: boolean
  lensID: string
}


const QuestionComponent: React.FC<QuestionProps> = ({ id, question, answer, sources, published, lensID}) => {
  const [votes, setVotes] = useState(0);
  const supabase = createClientComponentClient()
  const [user, setUser] = useState(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [])

  const handleUpvote = async () => {
    await apiClient('/increasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID})
      .then(result => {
        console.log('Popularity updated successfully', result);
        setVotes(votes + 1)
      })
      .catch(error => {
        console.error('Error in updating popularity block: ' + error.message);
        return;
      });    
  };

  const handleDownvote = async () => {
    await apiClient('/decreasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID})
    .then(result => {
      console.log('Popularity updated successfully', result);
      setVotes(votes - 1);

    })
    
    .catch(error => {
      console.error('Error in updating popularity block: ' + error.message);
      return;
    });  
  };

  return (
    <div className={clsx("elevated-block p-4 rounded-md bg-white border-orange-200 border mb-4 orange-shadow")}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <div className="prose text-gray-600">
            <strong>{question}</strong>
          </div>
          {published ? 
          <div>
          <div>
            <button onClick={handleUpvote}>Upvote</button>
          </div>
          <div>
            <button onClick={handleDownvote}>Downvote</button>
          </div>
          <div> Total Votes: {votes} </div>
        </div> : ""}
        </div>
        <div className="prose text-gray-600">
          <div>
            {answer}
          </div>
          {sources && sources.length > 0 && (
            <div className="mt-2">
              <strong>Sources:</strong>
              <ul>
                {sources.map(({ title, blockId }) => (
                  published ? <li key={blockId}><a href={`/publishedBlocks/${blockId}`}>{title}</a></li> : <li key={blockId}><a href={`/block/${blockId}`}>{title}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default QuestionComponent;
