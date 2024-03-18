import React, { useState, useEffect, useMemo } from 'react';
import { Anchor, Text, Button, Flex, Skeleton, Popover, Image } from '@mantine/core';
import BlockComponent from './BlockComponent';
import LoadingSkeleton from '../../LoadingSkeleton';
import { useProgressRouter } from 'app/_hooks/useProgressRouter';
import { Lens, LensData, Subspace } from 'app/_types/lens';
import { Block } from 'app/_types/block';
import { useAppContext } from "@contexts/context";
import OnboardingPopover from '@components/Onboarding/OnboardingPopover';

import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { PiCaretRightBold } from "@react-icons/all-files/pi/PiCaretRightBold";
import WhiteboardLineComponent from './WhiteboardLineComponent';
import SpreadsheetLineComponent from './SpreadsheetLineComponent';
import WidgetLineComponent from './WidgetLineComponent';
import { useSort } from 'app/_hooks/useSort';
import { Tables } from 'app/_types/supabase';
import { ListViewItemType } from '..';

type ItemType = Block | Tables<"whiteboard"> | Tables<"spreadsheet"> | Tables<"widget"> | Subspace;

type SubspaceComponentProps = {
  subspace: Subspace | Lens;
  leftComponent?: (type: string, id: Lens["lens_id"]) => React.ReactNode;
}
export default function SubspaceComponent({ leftComponent, subspace }: SubspaceComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [lensData, setLensData] = useState<LensData>();
  const router = useProgressRouter();

  const { onboardingStep, onboardingIsComplete, sortingOptions, goToNextOnboardingStep, completeOnboarding } = useAppContext();

  const handleSubspaceClick = () => {
    if (onboardingStep === 0 && !onboardingIsComplete) goToNextOnboardingStep();

    if (window.location.pathname === "/") return router.push(`/lens/${subspace.lens_id}`)
    else router.push(`${window.location.pathname}/${subspace.lens_id}`)
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      if (isExpanded) {
        try {
          const lensResponse = await fetch(`/api/lens/${subspace.lens_id}/getContent`);
          if (lensResponse.ok) {
            const lensData = await lensResponse.json();
            setLensData(lensData.data);

          }
        } catch (error) {
          console.error("An error occurred:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchData();
  }, [isExpanded]);

  const items = useMemo(() => [
    ...(lensData?.blocks || []),
    ...(lensData?.whiteboards || []),
    ...(lensData?.spreadsheets || []),
    ...(lensData?.widgets || []),
    ...(lensData?.subspaces || [])
  ], [lensData]);

  const sortedItems = useSort<ListViewItemType>({ sortingOptions, items });

  const itemRenderer = (item: ItemType) => {
    if ("whiteboard_id" in item) {
      return <>
        {leftComponent && leftComponent("whiteboard", item.whiteboard_id)}
        <WhiteboardLineComponent key={item.whiteboard_id} whiteboard={item} />
      </>
    }
    if ("spreadsheet_id" in item) {
      return <>
        {leftComponent && leftComponent("spreadsheet", item.spreadsheet_id)}
        <SpreadsheetLineComponent key={item.spreadsheet_id} spreadsheet={item} />
      </>
    }
    if ("block_id" in item) {
      return <>
        {leftComponent && leftComponent("block", item.block_id)}
        <BlockComponent key={item.block_id} block={item} />
      </>
    }
    if ("widget_id" in item) {
      return <>
        {leftComponent && leftComponent("widget", item.widget_id)}
        <WidgetLineComponent key={item.widget_id} widget={item} />
      </>
    }
    if ("lens_id" in item) {
      return <>
        {leftComponent && leftComponent("subspace", item.lens_id)}
        <SubspaceComponent key={item.lens_id} subspace={item} leftComponent={leftComponent} />
      </>
    }
  }

  const expandedContent = useMemo(() => {
    if (sortedItems.length === 0) {
      return (
        <Flex mt={10}>
          <Text size="sm" fw={400} c="gray.6">No pages found within this subspace.</Text>
        </Flex>
      )
    }
    return (
      <div>
        {sortedItems.map(itemRenderer)}
      </div>
    )

  }, [items, leftComponent, sortingOptions]);

  return (
    <div style={{ marginTop: 10 }} className="flex flex-col gap-1">
      <div className="flex items-center">
        <Button p={0} h={24} mr={4} color='gray' variant='subtle' size="xs" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded
            ? <PiCaretDownBold size={18} />
            : <PiCaretRightBold size={18} />
          }
        </Button>
        <Anchor size="xs" underline="never" onClick={handleSubspaceClick}>
          <Flex ml={3} align={"center"}>
            {(subspace.name === "Welcome to Yodeai!" && onboardingStep === 0 && !onboardingIsComplete)
              ?
              <OnboardingPopover
                stepToShow={0}
                width={500}
                position="right-start"
                popoverContent={
                  <>
                    <Text size="sm" mb={10}>Welcome to Yodeai! Here are a few <b>tips</b> to help you get familiar with your Yodeai workspace.</Text>
                    <Text size="sm" mb={10}>Click the <b>"Welcome to Yodeai!"</b> space to begin.</Text>
                    <Anchor onClick={() => completeOnboarding()} underline='always' c={"black"} size="sm">Or, click here to dismiss tips.</Anchor>
                  </>
                }
              >
                <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
              </OnboardingPopover>
              :
              <Text size="md" fw={600} c="gray.7">{subspace.name}</Text>
            }
          </Flex>
        </Anchor>
      </div>
      <div style={{ marginLeft: 24 }}>
        {isExpanded && (
          fetching
            ? <LoadingSkeleton boxCount={3} lineHeight={15} />
            : (lensData && expandedContent || "")
        )}
      </div>
    </div>
  );
}