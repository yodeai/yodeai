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
import Container from "./Container";
import { ShadowInnerIcon } from "@radix-ui/react-icons";
import UserAccountHandler from './UserAccount';
import { Lens } from "app/_types/lens";
import { useCallback } from "react";
import { createLens } from "@lib/api";
import LensComponent from "@components/LensComponent";

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

interface NavbarProps {
  session: Session | null;
  data: Lens[];
}
export default function Navbar({ data }: NavbarProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCreateLens = useCallback(async () => {
    await createLens("Untitled lens");
    router.refresh();
  }, [router]);

  return (
    <nav className="bg-white border-r px-4 flex flex-col fixed-width-nav">
      <Container className="flex flex-1 flex-col">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <Link href="/" className="font-semibold text-lg flex-grow-0 flex-shrink-0 w-full">
              Home
            </Link>
            <button
              onClick={handleCreateLens}
              className="flex items-center gap-2 text-sm font-semibold rounded px-2 py-1 bg-customLightBlue hover:bg-customLightBlue-hover text-white border border-customLightBlue shadow transition-colors"



            >
              <ShadowInnerIcon /> New lens
            </button>

          </div>
          <div className="mt-4">
            <Search
              onCommit={(block) => {
                router.push(`/blocks/${block.block_id}`);
              }}
            />
          </div>
          <ul className="mt-4 text-gray-600 flex flex-col gap-4">
            {data.map((lens) => (
              <LensComponent key={lens.lens_id} lens={lens} compact={true} />
            ))}

          </ul>
        </div>
      </Container>

      <div className="p-4">
        <Container className="border-t">

          <UserAccountHandler />

        </Container>
      </div>

    </nav>
  );
}