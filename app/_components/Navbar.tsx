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
import { FaInbox, FaHome, FaCodepen, FaThLarge, FaPlusSquare, FaPlus, FaFolder, FaFolderOpen, FaFolderPlus, FaArchive } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { set } from "date-fns";
import { Box, Button, Divider, Flex, NavLink, Paper } from "@mantine/core";

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
    setLensId(newLensId);
    console.log(lensId);
    reloadLenses();
    router.push(`/lens/${newLensId}?edit=true`);

  }, [router]);

  const handleNewBlock = (e: React.MouseEvent) => {
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

  return (
    <nav className="flex flex-col">
      <Button
        onClick={handleNewBlock}
        style={{ width: 176, height: 30, alignSelf: "center", margin: 10, borderRadius: 10, textAlign: "center" }}
        leftSection={<FaPlusSquare size={14} style={{ right: 10 }} />}
        color="gray"
        variant="gradient"
        opacity={0.9}
      >
        New
      </Button>
      {/* <NavLink
        onClick={handleNewBlock}
        label="New Block"
        leftSection={<FaPlusSquare size={14} />}
        active
        color="gray"
        variant="gradient"
        opacity={0.9}
      /> */}

      <NavLink
        onClick={handleHomeClick}
        label="My Blocks"
        leftSection={<FaThLarge size={14} />}
        style={{ minWidth: 200 }}
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

      <NavLink
        label="My Spaces"
        leftSection={<FaArchive size={14.5} style={{ marginLeft: 0.55 }} />}
        childrenOffset={28}
        defaultOpened
        color="#888"
        variant="subtle"
        active
      >
        <NavLink
          onClick={handleCreateLens}
          label="New Space"
          leftSection={<FaFolderPlus size={14} />}
          active
          variant="subtle"
        />
        {lenses?.map((lens) => (
          <LensComponent key={lens.lens_id} lens={lens} compact={true} />
        ))}
      </NavLink>
    </nav>
  );
}

