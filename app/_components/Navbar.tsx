"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Search from "./Search";
import {
  Session,
  createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import Button from "./Button";
import { notFound } from "next/navigation";
import Container from "./Container";
import { ShadowInnerIcon } from "@radix-ui/react-icons";
import UserAccountHandler from './UserAccount';
import { Lens } from "app/_types/lens";
import { createLens } from "@lib/api";
import LensComponent from "@components/LensComponent";
import { useLens } from "@contexts/lensContext";
import { useCallback, useState, useEffect } from "react";

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
  const { lensId, setLensId } = useLens();
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

  }, []);

  const handleCreateLens = useCallback(async () => {
    await createLens("New lens");
    router.refresh();
  }, [router]);

  const handleHomeClick = () => {
    setLensId(null);
    router.push(`/`);
  }


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


        <div className="mt-4 p-4">
          <Search
            onCommit={(block) => {
              router.push(`/blocks/${block.block_id}`);
            }}
          />
        </div>


        <ul className="mt-4 text-gray-600 flex flex-col gap-4">
          {lenses.map((lens) => (
            <LensComponent key={lens.lens_id} lens={lens} compact={true} />
          ))}
        </ul>
      </Container>

    </nav >
  );
}