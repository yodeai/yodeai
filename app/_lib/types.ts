import { Tables } from "app/_types/supabase";
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

export type ExplorerItemType = {
    type: "block" | "lens" | "whiteboard"
    reference_id?: Tables<"block">["block_id"] | Tables<"lens">["lens_id"] | Tables<"whiteboard">["whiteboard_id"];
    selectedItem: Tables<"block">["block_id"] | Tables<"lens">["lens_id"] | Tables<"whiteboard">["whiteboard_id"];
}

export type ExplorerConfiguration = {
    multiple?: boolean;
    sourceRef?: React.MutableRefObject<string>
}