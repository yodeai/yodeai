"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Container from "./Container";
import UserAccountHandler from './UserAccount';
import { Lens } from "app/_types/lens";
import LensComponent from "@components/LensComponent";
import { useAppContext } from "@contexts/context";
import { useCallback, useState, useEffect } from "react";
import { FaInbox, FaThLarge, FaPlusSquare, FaFolderPlus, FaCube, FaCubes, FaSquare, FaPlus } from "react-icons/fa";
import { FaFolderTree } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { set } from "date-fns";
import { Box, Button, Divider, Flex, NavLink, Paper, Popover } from "@mantine/core";

export function ActiveLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Link
      className={clsx(
        "px-2 py-1 rounded font-medium",
        pathname === href && "bg-gray-100 text-black"
      )}
      href={href}
    >
      {children}
    </Link>
  );
}


export default function Navbar() {


  const router = useRouter();
  const { lensId, setLensId, reloadKey, reloadLenses, activeComponent, setActiveComponent } = useAppContext();
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [ownedLenses, setOwnedLenses] = useState<Lens[]>([]);
  const [editorLenses, setEditorLenses] = useState<Lens[]>([]);
  const [readerLenses, setReaderLenses] = useState<Lens[]>([]);

  useEffect(() => {
    // Fetch the lenses
    fetch(`/api/lens/getAll`)
      .then((response) => response.json())
      .then((data) => {
        setLenses(data.data);
      })
      .catch((error) => {
        console.error("Error fetching lens:", error);
        notFound();
      });

    // fetch(`/api/lens/getOwnedLenses`)
    // .then((response) => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   return response.json();
    // })
    // .then((data) => {
    //   setOwnedLenses(data.data);
    // })
    // .catch((error) => {
    //   console.error("Error fetching owned lens:", error);
    //   notFound();
    // });


    // fetch(`/api/lens/getEditorLenses`)
    // .then((response) => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   return response.json();
    // })
    // .then((data) => {
    //   setEditorLenses(data.data);
    // })
    // .catch((error) => {
    //   console.error("Error fetching editor lens:", error);
    //   notFound();
    // });


    // fetch(`/api/lens/getReaderLenses`)
    // .then((response) => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   return response.json();
    // })
    // .then((data) => {
    //   setReaderLenses(data.data);
    // })
    // .catch((error) => {
    //   console.error("Error fetching reader lens:", error);
    //   notFound();
    // });


  }, [reloadKey]);

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
    router.push(`/lens/${newLensId}?edit=true`);

  }, [router]);

  const handleNewBlock = (e: React.MouseEvent) => {
    setOpened(false);
    setLensId(null);
    setActiveComponent("global");
    router.push(`/new`);
  };

  const handleOpenInbox = (e: React.MouseEvent) => {
    setLensId(null);
    setActiveComponent("inbox");
    router.push(`/inbox`);
  };

  const handleHomeClick = () => {
    setLensId(null);
    setActiveComponent("global");
    router.push(`/`);
  }

  // https://ui.mantine.dev/component/navbar-search/
  const [opened, setOpened] = useState(false);

  return (
    <nav className="flex flex-col">
      <Popover opened={opened} onChange={setOpened} width={200} position="bottom" shadow="md">
        <Popover.Target>
          <Button
            onClick={() => setOpened(!opened)}
            style={{ width: 188, height: 30, alignSelf: "center", margin: 10, borderRadius: 10, textAlign: "center" }}
            leftSection={<FaPlusSquare size={14} style={{ right: 10 }} />}
            color="gray"
            variant="gradient"
            opacity={0.9}
          >
            New
          </Button>
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

      <NavLink
        onClick={handleHomeClick}
        label="My Blocks"
        leftSection={<FaThLarge size={14} />}
        style={{ minWidth: 210 }}
        color={(!lensId && activeComponent === "global") ? "blue" : "#888"}
        variant={(!lensId && activeComponent === "global") ? "light" : "subtle"}
        active
      />

      <NavLink
        onClick={handleOpenInbox}
        label="Inbox"
        leftSection={<FaInbox style={{ marginTop: 2 }} />}
        color={(!lensId && activeComponent === "inbox") ? "blue" : "#888"}
        variant={(!lensId && activeComponent === "inbox") ? "light" : "subtle"}
        active
      />

      <Divider
        mb={0}
        label={
          <>
            <FaCubes size={12} />
            <Box ml={5}>My Spaces</Box>
          </>
        }
        labelPosition="center"
      />

      {lenses?.map((lens) => (
        <LensComponent key={lens.lens_id} lens={lens} compact={true} />
      ))}
    </nav>
  );
}

