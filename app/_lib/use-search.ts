import { useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import { search } from "./api";
import { Block } from "app/_types/block";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Block[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery).then(setResults);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  return {
    setQuery,
    results,
  };
}