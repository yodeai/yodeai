// components/QuestionComponent.tsx
"use client";
import React, { useState, useEffect } from 'react';
import clsx from "clsx";
import apiClient from '@utils/apiClient';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Anchor, List, Paper, Text } from '@mantine/core';

interface QuestionProps {
  id: string;
  question: string;
  answer: string;
  sources: { title: string; blockId: string }[];
  published: boolean
  lensID: string
}


const QuestionComponent: React.FC<QuestionProps> = ({ id, question, answer, sources, published, lensID }) => {
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
        const { data: totalVotes, error: totalVotesError } = await supabase.from("questions").select().eq("id", id)
        if (totalVotesError) {
          throw totalVotesError
        }
        setVotes(totalVotes[0].popularity)

        const { data: votes, error } = await supabase.from("question_votes").select().eq("user_id", user.id).eq("question_id", id)
        if (error) {
          throw error;
        }
        if (!votes || votes.length == 0) {
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
    await apiClient('/increasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID })
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
    await apiClient('/decreasePopularity', 'PATCH', { "row_id": id, "user_id": user.id, "lens_id": lensID })
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
    <Paper p="md" mb={10} withBorder>
      <div className="flex flex-col gap-3">
        <div>
          <Text size='sm' fw={500}>
            Q: {question}
          </Text>
        </div>
        <div className="prose text-gray-600">
          <Text size='sm'>
            {answer}
          </Text>
          {sources && sources.length > 0 && (
            <div className="mt-2">
              <Text size='sm' fw={500}>
                Sources:
              </Text>
              <List>
                {sources.map(({ title, blockId }) => (
                  published ?
                    <List.Item key={blockId}>
                      <Anchor size='sm' href={`/publishedBlocks/${blockId}`}>{title}</Anchor>
                    </List.Item>
                    :
                    <List.Item key={blockId}>
                      <Anchor size='sm' href={`/block/${blockId}`}>{title}</Anchor>
                    </List.Item>
                ))}
              </List>
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
    </Paper>

  );
};



export default QuestionComponent;
