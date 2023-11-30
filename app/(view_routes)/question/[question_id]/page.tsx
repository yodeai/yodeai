"use client"
import React, { useState, useEffect } from 'react';
import Container from "@components/Container";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Text } from '@mantine/core';
import { Skeleton } from '@mantine/core';

const QuestionAnswer = ({ params }: { params: {question_id: string } }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [question, setQuestion] = useState<{ id: string, question_text: string, answer_full: string}>();
    const supabase = createClientComponentClient()

    const getQandA = async () => {
        setIsLoading(true)
        const { data: questionData, error: error } = await supabase.from("questions").select().eq("id", params.question_id)
        setIsLoading(false)
        if (error) {
            console.log("Error retrieving question and answer for question id:", params.question_id)
            throw error;
        }
        setQuestion(questionData[0])
    }
    useEffect(() => {
        getQandA();
    }, [])
    
  return (
    <Container>
        {
            isLoading ? 
            <div className="container p-4 ">
                <Skeleton height={16} width="70%" />
                <Skeleton height={16} mt={6}/>
                <Skeleton height={16} mt={6}/>
            </div>
                : (
                question && (
                    <div className="container p-24">
                        <Text size="md" fw={500} tt="capitalize">{question.question_text}</Text>
                        <Text size="md" mt={24}>{question.answer_full}</Text>
                    </div>
                )
            )
        }
    </Container >
  );
};

export default QuestionAnswer;