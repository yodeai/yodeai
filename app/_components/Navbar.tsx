"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Search from "./Search";
import Button from "./Button";
import { notFound } from "next/navigation";
import Container from "./Container";
import { ShadowInnerIcon } from "@radix-ui/react-icons";
import UserAccountHandler from './UserAccount';
import { Lens } from "app/_types/lens";
import LensComponent from "@components/LensComponent";
import { useAppContext } from "@contexts/context";
import { useCallback, useState, useEffect } from "react";
import { FaInbox } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

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

  }, [reloadKey]);

  const handleCreateLens = useCallback(async () => {
    const response = await fetch("/api/lens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "New lens" }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const newLensId = data.data[0].lens_id;
    // Route to the new lens page and pass a 'edit' query parameter
    router.push(`/lens/${newLensId}?edit=true`);
    reloadLenses();
  }, [router]);

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
  console.log("Active component is: ", activeComponent);

  return (
    <nav className="bg-white border-r flex flex-col fixed-width-nav ">
      <Container className="flex flex-1 flex-col">

        <div className="flex flex-col items-start gap-2 p-4">
          <button className="font-semibold text-lg" onClick={handleHomeClick}>
            Home
          </button>
          <button
            onClick={handleCreateLens}
            className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-customLightBlue hover:bg-customLightBlue-hover text-white border border-customLightBlue shadow transition-colors"
          >
            <ShadowInnerIcon /> New lens
          </button>
        </div>

        {/* Commenting out the Search component for now */}
        {/*
        <div className="mt-4 p-4">
          <Search
            onCommit={(block) => {
              router.push(`/blocks/${block.block_id}`);
            }}
          />
        </div>
          */}

        <button
          className={`flex items-center mt-4 text-gray-600 gap-4 py-4 ${activeComponent === "inbox" ? "bg-customLightBlue-light" : ""}`}
          onClick={handleOpenInbox}
          style={{ paddingLeft: '12px', paddingRight: '5px' }} // Add padding to the left
        >
          <FaInbox style={{ marginLeft: '5px' }} /> { }
              Inbox
          
        </button>

        <ul className="mt-4 text-gray-600 flex flex-col gap-4">
          {lenses?.map((lens) => (
            <LensComponent key={lens.lens_id} lens={lens} compact={true} />
          ))}
        </ul>
      </Container>

    </nav >
  );
}