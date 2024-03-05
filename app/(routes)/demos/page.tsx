'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Flex, Title } from "@mantine/core";
import { Database } from "app/_types/supabase";
import FinishedOnboardingModal from "@components/Onboarding/FinishedOnboardingModal";

export default function Demo() {

  return (
    <Flex direction="column" pt={0} h="100%">
      <Flex align={"center"} className="flex items-stretch flex-col h-full">
        <div className="demo-video-container">
          <Title mt={20} mb={10} size="h3">User Insights</Title>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/SwwOU2VFsFs"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="demo-video-container">
          <Title mt={20} mb={10} size="h3">Pain Point Tracker</Title>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/6ojLFKqFeUQ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="demo-video-container">
          <Title mt={20} mb={10} size="h3">Competitive Analysis</Title>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/L9X9DdV9CJQ"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </Flex>

      <FinishedOnboardingModal />
    </Flex >
  );
}