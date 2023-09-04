import { Block } from "app/_types/block";

export async function search(query: string) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const json = (await response.json()).data as Block[];
  return json;
}

export async function link(from: number, to: number) {
  return fetch(`/api/blocks/${from}/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: to }),
  });
}

export async function createLens(name: string) {
  return fetch("/api/lens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: name }),
  });
}