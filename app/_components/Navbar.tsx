"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import LensComponent from "@components/LensComponent";
import { useAppContext } from "@contexts/context";
import React, { useCallback, useState } from "react";
import { FaInbox, FaThLarge, FaPlusSquare, FaCube, FaCubes, FaSquare, FaPlus } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { Box, Button, Divider, Flex, LoadingOverlay, NavLink, Popover, ScrollArea, Text } from "@mantine/core";
import { ActionIcon } from "@mantine/core";
import LoadingSkeleton from "./LoadingSkeleton";

export default function Navbar() {
  const router = useRouter();
  const {
    lensId, setLensId, reloadLenses, setActiveComponent,
    pinnedLenses, setPinnedLenses, pinnedLensesLoading, draggingNewBlock, layoutRefs
  } = useAppContext();
  const [stateOfLenses, setStateOfLenses] = useState<{ [key: string]: boolean }>({});
  const pathname = usePathname();

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
    setStateOfLenses({ ...stateOfLenses, [lens_id]: true });

    try {
      const pinResponse = await fetch(`/api/lens/${lens_id}/pin`, { method: "DELETE" });
      if (pinResponse.ok) {
        setPinnedLenses(pinnedLenses.filter((lens) => lens.lens_id != lens_id));
        setStateOfLenses({ ...stateOfLenses, [lens_id]: false });
        console.log("Lens unpinned");
      }
      if (!pinResponse.ok) console.error("Failed to unpin lens");
    } catch (error) {
      console.error("Error pinning lens:", error);
    }
  }

  const [opened, setOpened] = useState(false);

  return <>
    <Popover opened={opened} onChange={setOpened} width={200} position="bottom" shadow="md">
      <Popover.Target>
        <Flex align={"center"} justify={"center"}>
          <Button
            onClick={() => setOpened(!opened)}
            style={{ width: 200, height: 30, alignSelf: "center", margin: 10, marginBottom: 0, borderRadius: 10, textAlign: "center" }}
            leftSection={<FaPlusSquare size={14} style={{ right: 10 }} />}
            color="gray"
            variant="gradient"
            opacity={0.9}
          >
            New
          </Button>
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
              <Box ml={10}>New Block</Box>
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
      <Link href="/" className="no-underline">
        <NavLink
          component="div"
          label="Home"
          leftSection={<FaHouse size={18} />}
          color={pathname === "/" ? "blue" : "#888"}
          variant={pathname === "/" ? "light" : "subtle"}
          active
        />
      </Link>
      <Link href="/myblocks" className="no-underline">
        <NavLink
          component="div"
          label="My Blocks"
          leftSection={<FaThLarge size={18} />}
          color={pathname === "/myblocks" ? "blue" : "#888"}
          variant={pathname === "/myblocks" ? "light" : "subtle"}
          active
        />
      </Link>
      <Link href="/inbox" className="no-underline">
        <NavLink
          component="div"
          label="Inbox"
          leftSection={<FaInbox size={18} />}
          color={pathname === "/inbox" ? "blue" : "#888"}
          variant={pathname === "/inbox" ? "light" : "subtle"}
          active
        />
      </Link>
    </Flex>

    <Divider
      mb={3}
      mt={3}
      pl={8}
      pr={8}
      label={
        <>
          <FaCubes size={12} />
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
              <LoadingOverlay visible={stateOfLenses[lens.lens_id] || false}></LoadingOverlay>
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
  </>
}

