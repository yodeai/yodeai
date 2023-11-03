// components/QuestionComponent.tsx
"use client";
import React from 'react';
import clsx from "clsx";

interface QuestionProps {
  question: string;
  answer: string;
  sources: { title: string; blockId: string }[];
  published: boolean
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, answer, sources, published }) => {
  return (
    <div className={clsx("elevated-block p-4 rounded-md bg-white border-orange-200 border mb-4 orange-shadow")}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <div className="prose text-gray-600  ">
            <strong>{question}</strong>
          </div>
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
                  published ? <li key={blockId}><a href={`/publishedBlocks/${blockId}`}>{title}</a></li> :  <li key={blockId}><a href={`/block/${blockId}`}>{title}</a></li>
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
