// components/QuestionComponent.tsx
"use client";
import React, {useState, useEffect} from 'react';
import clsx from "clsx";
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import ReactMarkdown from 'react-markdown';

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
  const [currentVote, setCurrentVote] = useState(0)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      getVotes(user);
    };

    const getVotes = async (user) => {
      if (id && published) {
        const {data: totalVotes, error: totalVotesError} = await supabase.from("questions").select().eq("id", id)
        if (totalVotesError) {
          throw totalVotesError
        }
        setVotes(totalVotes[0].popularity)

        const {data: votes, error} = await supabase.from("question_votes").select().eq("user_id", user.id).eq("question_id", id)
        if (error) {
          throw error;
        }
        if (!votes || votes.length == 0){
          return;
        }
        setCurrentVote(votes[0].vote);
    }

    }
    getUser();
  }, [])

  const handleUpvote = async () => {
    if (currentVote == 1) {
      return;
    }
    await apiClient('/increasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID})
      .then(result => {
        setVotes(votes + 1)
        setCurrentVote(1);
      })
      .catch(error => {
        console.error('Error in updating popularity block: ' + error.message);
        return;
      }); 
    };

  const handleDownvote = async () => {
    if (currentVote == -1) {
      return;
    }
    await apiClient('/decreasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID})
    .then(result => {
      setVotes(votes - 1);
      setCurrentVote(-1);

    })
    
    .catch(error => {
      console.error('Error in updating popularity block: ' + error.message);
      return;
    });  
  };

  return (
    <div className={clsx("elevated-block p-4 rounded-md bg-white border-orange-200 border mb-4 orange-shadow")}>
  <div className="flex flex-col gap-3">
    <div className="prose text-gray-600">
      <strong>{question}</strong>
    </div>
    <div className="prose text-gray-600">
      <div>
        <ReactMarkdown>
         {answer}
        </ReactMarkdown>
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
    {published ?
   <div className="flex items-center">
   <div>
     <button className={`my-div-class ${currentVote === 1 ? 'bg-green-700' : ''}`} onClick={handleUpvote}>Upvote</button>
   </div>
   <span className="mx-2">|</span> {/* Add a separator (you can adjust the spacing by changing mx-2) */}
   <div>
     <button className={`my-div-class ${currentVote === -1 ? 'bg-red-700' : ''}`} onClick={handleDownvote}>Downvote</button>
   </div>
   <span className="mx-2">|</span> {/* Add a separator (you can adjust the spacing by changing mx-2) */}

   <div>Total Votes: {votes}</div>
 </div>
: ""}
  </div>
</div>

  );
};



export default QuestionComponent;
