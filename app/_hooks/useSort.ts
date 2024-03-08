import { useMemo } from "react";
import { Tables } from "app/_types/supabase";
import { Lens, Subspace } from "app/_types/lens";
import { Block } from "app/_types/block";

type UseSortProps<T> = {
    sortingOptions: any;
    items: T[]
}
export const useSort = <T extends {}>(props: UseSortProps<T>) => {
    const { sortingOptions, items } = props;

    const typeOrder = {
        "whiteboard": 1,
        "whiteboard_plugin": 2,
        "spreadsheet": 3,
        "spreadsheet_plugin": 4,
        "widget": 5,
        "lens": 6,
        "block": 7
    };

    const getType = (item: Tables<"block"> | Tables<"whiteboard"> | Tables<"spreadsheet"> | Tables<"widget"> | Lens | Subspace | Block) => {
        if ("widget_id" in item) {
            return "widget";
        } else if ("block_id" in item) {
            return "block";
        } else if ("whiteboard_id" in item) {
            if ((item.plugin as any)?.name) return "whiteboard_plugin";
            return "whiteboard";
        } else if ("spreadsheet_id" in item) {
            if ((item.plugin as any)?.name) return "spreadsheet_plugin";
            return "spreadsheet";
        } else {
            return "lens";
        }
    }

    const sortedItems = useMemo(() => {
        if (sortingOptions.sortBy === null) return items;

        let _sorted_items = [...items].sort((a: any, b: any) => {
            if (sortingOptions.sortBy === "name") {
                let aName = "block_id" in a ? a.title : a.name;
                let bName = "block_id" in b ? b.title : b.name;
                return aName.localeCompare(bName);
            } else if (sortingOptions.sortBy === "createdAt") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortingOptions.sortBy === "updatedAt") {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            } else if (sortingOptions.sortBy === "type") {
                return typeOrder[getType(a)] - typeOrder[getType(b)];
            }
        });

        if (sortingOptions.order === "desc") {
            _sorted_items = _sorted_items.reverse();
        }
        return _sorted_items;

    }, [items, sortingOptions]);

    return sortedItems;
}