import toast from "react-hot-toast";

/**
 * Display a toast message while a promise is pending.
 * @param promise The promise to await.
 * @param messages The messages to display for the promise's states: loading, success, and error.
 * @returns The promise's resolved value.
 */
export default async function load<T>(
  promise: Promise<T>,
  messages: Parameters<typeof toast.promise>[1],
  handleAbortError=false
) {
  function handleAbortErrorFunction(error, id) {
    if (error.name == 'AbortError') {
      console.log("abort error")
      toast.success("Saved!", {id})
    } else {
      toast.error("Failed to save.", {id})
    }
  }
  if (handleAbortError) {
    const id = toast.loading(messages.loading);

    promise
      .then((p) => {
        toast.success("Saved!", {id});
        return p;
      })
      .catch((error) => handleAbortErrorFunction(error, id));
  
    return promise;
  } else {
    console.log("used default")
    return toast.promise(promise, messages).catch();
  }
}