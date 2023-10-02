"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import Link from "next/link";
import BlockComponent from "@components/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Lens } from "app/_types/lens";
import load from "@lib/load";
import LoadingSkeleton from '@components/LoadingSkeleton';
import { Pencil2Icon, TrashIcon, PlusIcon, Share1Icon } from "@radix-ui/react-icons";

import { useLens } from "@contexts/lensContext";
import { Button, Tooltip } from 'flowbite-react';
import ShareLensComponent from "@components/ShareLensComponent";


//import { useRouter } from 'next/router';
import { useRouter } from "next/navigation";
import QuestionAnswerForm from "@components/QuestionAnswerForm";
import LensViewForm from "@components/LensViewForm";

export default function ViewLens({ params }: { params: { lens_id: string } }) {
  const router = useRouter();

  console.log(params.lens_id);

  return (
    <> 
      <LensViewForm lensId={params.lens_id}/>
    </>
  );
}