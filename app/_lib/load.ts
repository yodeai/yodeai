import toast from "react-hot-toast";

/**
 * Display a toast message while a promise is pending.
 * @param promise The promise to await.
 * @param messages The messages to display for the promise's states: loading, success, and error.
 * @returns The promise's resolved value.
 */
export default async function load<T>(
  promise: Promise<T>,
  messages: Parameters<typeof toast.promise>[1]
) {
  return toast.promise(promise, messages);
}