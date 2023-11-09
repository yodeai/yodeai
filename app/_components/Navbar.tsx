"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Container from "./Container";
import { ShadowInnerIcon, HomeIcon} from "@radix-ui/react-icons";
import UserAccountHandler from './UserAccount';
import { Lens } from "app/_types/lens";
import LensComponent from "@components/LensComponent";
import { useAppContext } from "@contexts/context";
import { useCallback, useState, useEffect } from "react";
import { FaInbox, FaHome, FaCodepen } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { set } from "date-fns";

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



  return (
    <nav className="bg-white border-r flex flex-col fixed-width-nav ">
      <Container className="flex flex-1 flex-col">

        <div className="flex flex-col items-start gap-2 p-4">

          <button
            onClick={handleCreateLens}
            className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-customLightBlue hover:bg-customLightBlue-hover text-white border border-customLightBlue shadow transition-colors"
          >
            <ShadowInnerIcon /> New space
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
        <button className={`flex items-center mt-4 text-gray-600 gap-4 py-2 px-4 ${activeComponent === "global" ? "bg-customLightBlue-light" : ""}`} onClick={handleHomeClick}>
        <FaHome  className="iconStyle" /> { }
        All Blocks
        </button>
        <button
          className={`flex items-center mt-4 text-gray-600 gap-4 py-2 px-4 ${activeComponent === "inbox" ? "bg-customLightBlue-light" : ""}`}
          onClick={handleOpenInbox}
          
        >
          <FaInbox  className="iconStyle" /> { }
          Inbox

        </button>


        <ul className="text-gray-600 flex flex-col">
          {lenses?.map((lens) => (
            <LensComponent key={lens.lens_id} lens={lens} compact={true} />
          ))}
        </ul>

      
      </Container>

    </nav >
  );
}