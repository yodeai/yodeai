// components/QuestionComponent.tsx
"use client";
import React from 'react';
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

interface QuestionProps {
  question: string;
  answer: string;
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, answer }) => {
  return (
    <div className={clsx("elevated-block p-4 rounded-md bg-white border-orange-200 border mb-4 orange-shadow")}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center">
          <div className="prose text-gray-600 line-clamp-1 ">
            {question}
          </div>
        </div>
        <div className="prose text-gray-600">
          <div>
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionComponent;
