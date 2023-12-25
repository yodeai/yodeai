import { RoomProvider } from "../../liveblocks.config";
import { CollaborativeEditor } from "./CollaborativeEditor";
import { ClientSideSuspense } from "@liveblocks/react";

export default function CollabRoom() {
  return (
    <RoomProvider id="my-room" initialPresence={{}}>
      <ClientSideSuspense fallback="Loading…">
        {() => <CollaborativeEditor />}
      </ClientSideSuspense>
    </RoomProvider>
  );
}