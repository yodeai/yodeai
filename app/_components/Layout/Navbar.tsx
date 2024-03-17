"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { FaHouse } from "@react-icons/all-files/fa6/FaHouse";
import { RiPushpinFill } from "@react-icons/all-files/ri/RiPushpinFill";

import { FaInbox } from "@react-icons/all-files/fa/FaInbox";
import { FaThLarge } from "@react-icons/all-files/fa/FaThLarge";
import { FaPlusSquare } from "@react-icons/all-files/fa/FaPlusSquare";
import { FaCube } from "@react-icons/all-files/fa/FaCube";
import { FaSquare } from "@react-icons/all-files/fa/FaSquare";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";

import LensComponent from "@components/LensComponent";
import { useAppContext } from "@contexts/context";
import React, { useCallback, useState } from "react";
import { Box, Button, Divider, Flex, LoadingOverlay, NavLink, Popover, ScrollArea, Text, AppShell } from "@mantine/core";
import { ActionIcon } from "@mantine/core";
import LoadingSkeleton from "../LoadingSkeleton";

import OnboardingPopover from "../Onboarding/OnboardingPopover";
import { Database } from "app/_types/supabase";


export default function Navbar() {
  const router = useRouter();
  const {
    lensId, setLensId, reloadLenses, activeComponent, setActiveComponent,
    pinnedLenses, setPinnedLenses, draggingNewBlock, layoutRefs,
    onboardingStep, onboardingIsComplete
  } = useAppContext();
  const [stateOfLenses, setStateOfLenses] = useState<{ [key: string]: boolean }>({});
  const pathname = usePathname();
  const [pinnedLensesLoading, setPinnedLensesLoading] = useState(true);

  const getPinnedLenses = async () => {
    fetch(`/api/lens/pinneds`)
      .then((response) => response.json())
      .then((data) => {
        setPinnedLenses(data.data);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        // notFound();
      })
      .finally(() => {
        setPinnedLensesLoading(false);
      })
  }

  const handleCreateLens = useCallback(async () => {
    const response = await fetch("/api/lens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "New space" }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const newLensId = data.data[0].lens_id;
    // Route to the new lens page and pass a 'edit' query parameter
    setOpened(false);
    setLensId(newLensId);
    console.log(lensId);
    reloadLenses();
    router.push(`/lens/${newLensId}#newLens`);
  }, [router]);

  const handleNewBlock = (e: React.MouseEvent) => {
    setOpened(false);
    setLensId(null);
    setActiveComponent("global");
    router.push(`/new`);
  };

  const handleUnpinLens = async (lens_id: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.nativeEvent.stopImmediatePropagation();
    setStateOfLenses({ ...stateOfLenses, [lens_id]: true });

    try {
      const pinResponse = await fetch(`/api/lens/${lens_id}/pin`, { method: "DELETE" });
      if (pinResponse.ok) {
        setPinnedLenses(pinnedLenses.filter((lens) => lens.lens_id !== lens_id));
        setStateOfLenses({ ...stateOfLenses, [lens_id]: false });
        console.log("Lens unpinned");
      }
      if (!pinResponse.ok) console.error("Failed to unpin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  useEffect(() => {
    getPinnedLenses();
  }, [])

  const [opened, setOpened] = useState(false);

  const togglePopover = () => {
    const newState = !opened;
    setOpened(newState);
  };

  return <AppShell.Navbar ref={layoutRefs.navbar}>
    <Popover opened={opened} onChange={setOpened} width={200} position="bottom" shadow="md">
      <Popover.Target>
        <Flex align={"center"} justify={"center"}>
          {(onboardingStep === 5 && !onboardingIsComplete)
            ?
            <OnboardingPopover
              width={430}
              stepToShow={5}
              position="right-start"
              popoverContent={
                <>
                  <Text size="sm" mb={10}>The Yodeai agent answers questions based on the pages within a particular <b>space.</b></Text>
                  <Text size="sm">To create a space, click <b>+ New</b> then <b>+ New Space</b></Text>
                </>
              }
            >
              <Button
                onClick={togglePopover}
                className="w-full"
                style={{ width: "100%", height: 30, alignSelf: "center", margin: 10, marginBottom: 0, borderRadius: 10, textAlign: "center" }}
                leftSection={<FaPlusSquare size={14} style={{ right: 10 }} />}
                color="gray"
                variant="gradient"
                opacity={0.9}
              >
                New
              </Button>
            </OnboardingPopover>
            :
            <Button
              onClick={togglePopover}
              style={{ width: "100%", height: 30, alignSelf: "center", margin: 10, marginBottom: 0, borderRadius: 10, textAlign: "center" }}
              leftSection={<FaPlusSquare size={14} style={{ right: 10 }} />}
              color="gray"
              variant="gradient"
              opacity={0.9}
            >
              New
            </Button>
          }
        </Flex>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <NavLink
          onClick={handleNewBlock}
          ta={"center"}
          label={
            <Flex ml={-8} align={"center"} justify={"center"} direction={"row"}>
              <FaPlus style={{ marginRight: 1 }} size={8} />
              <FaSquare size={12} />
              <Box ml={10}>New Page</Box>
            </Flex>
          }
          active
          variant="subtle"
        />
        <NavLink
          onClick={handleCreateLens}
          ta={"center"}
          label={
            <Flex ml={-8} align={"center"} justify={"center"} direction={"row"}>
              <FaPlus style={{ marginRight: 1 }} size={8} />
              <FaCube size={12} />
              <Box ml={10}>New Space</Box>
            </Flex>
          }
          active
          variant="subtle"
        />
      </Popover.Dropdown>
    </Popover>

    <Flex direction="column" gap={5} mt={10}>
      <Link href="/" className="no-underline" prefetch>
        <NavLink
          component="div"
          label="Home"
          leftSection={<FaHouse size={18} />}
          color={pathname === "/" ? "blue" : "#888"}
          variant={pathname === "/" ? "light" : "subtle"}
          active
        />
      </Link>
      <Link href="/myblocks" className="no-underline" prefetch>
        <NavLink
          component="div"
          label="My Pages"
          leftSection={<FaThLarge size={18} />}
          color={pathname === "/myblocks" ? "blue" : "#888"}
          variant={pathname === "/myblocks" ? "light" : "subtle"}
          active
        />
      </Link>
      <Link href="/inbox" className="no-underline" prefetch>
        <NavLink
          component="div"
          label="Inbox"
          leftSection={<FaInbox size={18} />}
          color={pathname === "/inbox" ? "blue" : "#888"}
          variant={pathname === "/inbox" ? "light" : "subtle"}
          active
        />
      </Link>
      {/* <Anchor onClick={resetOnboarding}>{onboardingStep}</Anchor> */}
    </Flex>

    <Divider
      mb={3}
      mt={3}
      pl={8}
      pr={8}
      label={
        <>
          <RiPushpinFill size={12} />
          <Box ml={5}>Pinned Spaces</Box>
        </>
      }
      labelPosition="center"
    />

    <Flex direction="column" ref={layoutRefs.sidebar} className={`${draggingNewBlock && "bg-gray-100"} flex-1 relative overflow-scroll`}>
      <ScrollArea.Autosize scrollbarSize={0} mah="auto">
        {draggingNewBlock && <Box m={5} className="bg-gray-200 rounded-md" h={30}>
          <Text p={5} size="sm" c="gray.6" className="text-center">Pin here</Text>
        </Box>}
        {pinnedLensesLoading && (<LoadingSkeleton m={10} />) || ""}
        {!pinnedLensesLoading && (pinnedLenses.length > 0
          ? pinnedLenses.map((lens) => (
            <Box key={lens.lens_id} pos="relative">
              <LoadingOverlay visible={stateOfLenses[lens.lens_id] || false} loaderProps={{ size: 20 }}></LoadingOverlay>
              <LensComponent
                lens={lens} compact={true}
                rightSection={
                  <ActionIcon variant="subtle" color="gray" onClick={handleUnpinLens.bind(this, lens.lens_id)}>
                    <IoMdClose size={16} />
                  </ActionIcon>
                }
              />
            </Box>
          ))
          : pinnedLenses.length === 0 && (
            <Text mt={5} size="sm" c="gray.5" className="text-center">No pinned spaces</Text>
          ))}
      </ScrollArea.Autosize>
    </Flex>
  </AppShell.Navbar>
}

