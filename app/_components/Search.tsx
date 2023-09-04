"use client";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Dialog from "./Dialog";
import { useEffect, useState } from "react";
import Button from "./Button";
import { useSearch } from "@lib/use-search";
import { Block } from "app/_types/block";

interface SearchProps {
  onCommit?: (block: Block) => void;
  label?: string;
}
export default function Search({
  onCommit: handleCommit,
  label = "Search",
}: SearchProps) {
  const [open, setOpen] = useState(false);
  const { setQuery, results } = useSearch();

  // Toggle the menu when Cmd+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          className="px-2 py-1 border rounded-lg w-full text-sm"
        >
          <MagnifyingGlassIcon /> {label}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title asChild>
          <label htmlFor="search" className="flex items-center p-4 border-b">
            <MagnifyingGlassIcon className="h-[1em] w-[1em]" />
            <input
              id="search"
              type="text"
              className="w-full ring-0 pl-2"
              placeholder={label}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </Dialog.Title>
        {results.length === 0 ? (
          <Dialog.Description className="text-gray-600 p-4">
            No results
          </Dialog.Description>
        ) : (
          <ul className="divide-y divide-gray-200">
            {results.map((result) => (
              <li
                key={result.id}
                onClick={() => {
                  setOpen(false);
                  handleCommit?.(result);
                }}
                className="block cursor-pointer hover:bg-gray-100 p-4 transition-colors"
              >
                {result.text}
              </li>
            ))}
          </ul>
        )}
      </Dialog.Content>
    </Dialog>
  );
}