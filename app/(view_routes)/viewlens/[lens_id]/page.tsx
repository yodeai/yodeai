"use client";
import { notFound } from "next/navigation";
import Container from "@components/Container";
import Link from "next/link";
import BlockComponent from "@components/ListView/Views/BlockComponent";
import { Block } from "app/_types/block";
import { useState, useEffect, ChangeEvent, useContext } from "react";
import { Lens } from "app/_types/lens";
import load from "@lib/load";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

//import { useRouter } from 'next/router';
import { useProgressRouter } from "app/_hooks/useProgressRouter";
import QuestionAnswerForm from "@components/Pages/Toolbar/LensQuestions/QuestionListComponent";
import LensViewOnlyForm from "@components/LensViewOnlyForm";

export default function ViewLens({ params }: { params: { lens_id: string } }) {
  const supabase = createClientComponentClient()
  const [published, setPublished] = useState(false);
  const router = useProgressRouter();
  useEffect(()=> {
    const checkPublishedLens = async() => {
      const { data: lens, error } = await supabase
      .from('lens_published')
      .select()
      .eq('lens_id', params.lens_id);
      if (error) {
          console.log("error", error.message)
      } else {
          if (!lens[0]) router.push("/notFound");
          setPublished(true)
      }
  } 
    checkPublishedLens();
  }, [])

  return (
    <> 
      {published ? <LensViewOnlyForm lensId={params.lens_id}/> : ""}
    </>
  );
}