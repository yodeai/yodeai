"use client";

import { useExplorer } from '@contexts/explorer';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Input, CloseButton, Box, Text, Chip, ScrollArea, Button, FocusTrap } from '@mantine/core';
import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';
import LoadingSkeleton from '@components/LoadingSkeleton';
import BlockColumnHeader from '@components/Block/BlockColumnHeader';
import toast from 'react-hot-toast';

import { ExplorerItemType } from '@lib/types';
import { Tables } from 'app/_types/supabase';
import { Block } from 'app/_types/block';
import { Subspace } from 'app/_types/lens';
import { ExplorerItemComponent } from './ExplorerItem';

import { FaSearch } from '@react-icons/all-files/fa/FaSearch';
import { MdSearchOff } from '@react-icons/all-files/md/MdSearchOff';

type ExplorerProps = {
    selectedItems: ExplorerItemType[],
    setSelectedItems: React.Dispatch<React.SetStateAction<ExplorerItemType[]>>;
}

const Explorer: React.FC<ExplorerProps> = ({ selectedItems, setSelectedItems }) => {
    const { modal } = useExplorer();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<{ blocks: Block[], lenses: Subspace[], whiteboards: Tables<"whiteboard">[] } | undefined>();
    const [search, setSearch] = useState("");

    const handleSearch = useDebouncedCallback(() => {
        if (!search) {
            setItems(undefined);
            return;
        }
        setLoading(true);
        const searchParams = new URLSearchParams({ q: search });
        fetch(`/api/search?${searchParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) setItems(data.data);
                if (!data.ok) {
                    toast.error('Error searching: ' + data.error);
                    setItems(undefined);
                }
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => {
                setLoading(false);
            })
    }, 500, [search]);

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") handleSearch();
    }

    useEffect(() => {
        if (modal.opened === false) {
            setItems(undefined);
            setSelectedItems(undefined);
            setSearch("");
        }
    }, [modal.opened]);

    const onChipChange = useCallback((value: string | string[]) => {
        const values = (Array.isArray(value) ? value : [value]).reduce((arr: ExplorerItemType[], el: string) => {
            const [type, id] = el.split("_") as [ExplorerItemType["type"], string];
            arr.push({ type, selectedItem: Number(id) });
            return arr;
        }, []);

        setSelectedItems(values)
    }, [modal.config.multiple]);

    const onSelectItems = () => {
        modal.actions.close();
    }

    const hasResults = useMemo(() => {
        return items && (items.blocks?.length > 0 || items.lenses?.length > 0 || items.whiteboards?.length > 0);
    }, [items]);

    const whiteboardItems = useMemo(() => {
        if (!items) return [];
        return [
            ...items.blocks?.map(block => ({ type: "block", id: block.block_id, data: block })),
            ...items.whiteboards?.map(whiteboard => ({ type: "whiteboard", id: whiteboard.whiteboard_id, data: whiteboard })),
            ...items.lenses?.map(lens => ({ type: "lens", id: lens.lens_id, data: lens })),
        ];
    }, [items])

    return <Modal title="Search in items" size="xl" opened={modal.opened} onClose={modal.actions.close}>
        <FocusTrap active>
            <Input
                data-autofocus
                placeholder="Type to search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                rightSectionPointerEvents="all"
                mt="md"
                leftSection={<FaSearch />}
                onKeyDown={onKeyDown}
                rightSection={
                    <CloseButton
                        aria-label="Clear input"
                        onClick={() => setSearch('')}
                        style={{ display: search ? undefined : 'none' }}
                    />
                }
            />
        </FocusTrap>

        <div className="mt-5">
            {loading && <LoadingSkeleton boxCount={8} lineHeight={50} />}
            {!loading && !items && <Box mt="md" h="300px" className="flex justify-center items-center gap-3">
                <FaSearch size={18} color="#888" />
                <Text size="18px" className="text-[#888] font-light">Search in your blocks, subspaces and whiteboards</Text>
            </Box> || ""}

            {!loading && items && !hasResults && <Box mt="md" h="300px" className="flex justify-center items-center gap-3">
                <MdSearchOff size={32} color="#555" />
                <Text size="24px" className="text-[#555]">No results</Text>
            </Box> || ""}

            {!loading && items && hasResults && <div className="block-container w-full">
                <BlockColumnHeader />

                <ScrollArea className="block-list" style={{ height: "calc(100vh - 350px)" }}>
                    <Chip.Group
                        value={
                            (modal.config.multiple
                                ? Array.isArray(selectedItems) && selectedItems.map(item => String(`${item.type}_${item.selectedItem}`))
                                : Array.isArray(selectedItems) && selectedItems.length > 0 && String(`${selectedItems[0].type}_${selectedItems[0].selectedItem}`) || undefined
                            )
                        } onChange={onChipChange} multiple={modal.config.multiple}>
                        {whiteboardItems.map(item =>
                            <ExplorerItemComponent key={item.id} type={item.type} data={item.data} />)}
                    </Chip.Group>
                </ScrollArea>

                <div className="flex justify-end mt-5">
                    <Button onClick={onSelectItems}>Select</Button>
                </div>
            </div>}
        </div>
    </Modal>

}

export default Explorer;