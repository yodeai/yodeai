'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Container from "@components/Container";
import { Button, Flex, Modal, Text, LoadingOverlay, Radio, Group, CheckIcon, Select, Checkbox } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import toast from 'react-hot-toast';

import { cn } from '@utils/style';
import fileTypeIcons from './icons';
import { Tables } from 'app/_types/supabase';
import { Lens, Subspace } from 'app/_types/lens';
import load from '@lib/load';

type IconItemSettingProps = {
    item_icons: Lens["item_icons"]
    lens_id: number;
    modalController: ReturnType<typeof useDisclosure>;
    item: Lens | Subspace | Tables<"block"> | Tables<"whiteboard">;
}
export default function IconItemSettings({ lens_id, item_icons = {}, modalController, item }: IconItemSettingProps) {
    const [loading, setLoading] = useState(false);
    const [opened, { close }] = modalController;
    const [selectedIcon, setSelectedIcon] = useState("");
    const [iconForAllInstances, setIconForAllInstances] = useState(false);

    const item_id = useMemo<number | null>(() => {
        if (!item) return null;
        if ("whiteboard_id" in item) return item.whiteboard_id;
        if ("block_id" in item) return item.block_id;
        if ("subspace_id" in item) return item.lens_id;
        return null;
    }, [item]);

    const itemTitle = useMemo(() => {
        if (!item) return null;
        if ("whiteboard_id" in item) return item.name;
        if ("block_id" in item) return item.title;
        if ("subspace_id" in item) return item.name;
        return null;
    }, [item]);

    const getDefaultIcon = (item: IconItemSettingProps["item"]) => {
        if ("whiteboard_id" in item) {
            if (item.whiteboard_id in item_icons) {
                return item_icons[item.whiteboard_id];
            }
            if ((item.plugin as any)?.name && `plugin_${(item.plugin as any)?.name}` in fileTypeIcons) {
                const whiteboardPluginName = `plugin_${(item.plugin as any)?.name}`;
                if (whiteboardPluginName in fileTypeIcons) {
                    return whiteboardPluginName;
                }
            }
            return "whiteboard";
        }
        if ("block_id" in item) {
            if (item.block_id in item_icons) {
                return item_icons[item.block_id];
            }
            return "note";
        }
        if ("subspace_id" in item) {
            if (item.lens_id in item_icons) return item_icons[item.lens_id];
            return "subspace";
        }
        return "note";
    }

    const onSave = useCallback(() => {
        if (!item_id) return;

        setLoading(true);
        const updatePromise = fetch(`/api/lens/${lens_id}/icons`, {
            method: "POST",
            body: JSON.stringify({
                item_icons: {
                    ...item_icons,
                    [item_id]: selectedIcon
                }
            }),
        });

        return load<Response>(updatePromise, {
            loading: "Updating item...",
            success: "Item settings updated!",
            error: "Failed to update item settings.",
        }).then(response => {
            setLoading(false);
            close();
        })
    }, [item_id, selectedIcon])

    useEffect(() => {
        if (!item || !opened) return;

        const defaultIcon = getDefaultIcon(item);
        setSelectedIcon(defaultIcon)
    }, [opened, item_icons]);

    const icons = useMemo(() => {
        return Object.entries(fileTypeIcons).map(([key, value]) => {
            return {
                value: key,
                icon: value
            }
        });
    }, [opened]);

    if (!selectedIcon) return null;

    return <Container className="max-w-3xl absolute">
        <Modal zIndex={299} closeOnClickOutside={true} opened={opened} onClose={close} title={<Text size='lg' fw={600}>Settings</Text>} centered>
            <Modal.Header p={0} m={0}>
                <Text size='sm' component='p' fw={600}>Custom Icon</Text>
            </Modal.Header>
            {!iconForAllInstances && <Text size="xs" component='p'>You are changing icon for "{itemTitle}" item.</Text>}
            {iconForAllInstances && <Text size="xs" component='p'>You are changing icon for all items.</Text>}

            <Modal.Body p={2} pt={0}>
                <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                <Radio.Group
                    name="customIcon"
                    value={selectedIcon}
                    defaultValue={selectedIcon}
                    onChange={(value) => setSelectedIcon(value)}
                    className="pt-5 h-full">
                    <Group
                        className="h-full flex flex-wrap gap-y-[10px!important] gap-x-[8px!important]">
                        {icons.map(icon => (
                            <Radio
                                classNames={{
                                    radio: "hidden",
                                    icon: "hidden",
                                    inner: "hidden",
                                    label: "pl-[0!important] pr-[0!important] cursor-pointer"
                                }}
                                className="cursor-pointer w-[50px] h-[50px] flex"
                                key={icon.value} value={icon.value}
                                label={

                                    <div className={cn("w-[50px] h-[50px] rounded-lg border border-gray-400 flex items-center justify-center cursor-pointer hover:bg-gray-100",
                                        icon.value === selectedIcon ? "bg-blue-300" : "bg-white"
                                    )}>
                                        <icon.icon size={32} color="var(--tw-bg-blue-300)" className={
                                            cn("fill-gray-400 items-center justify-center",
                                                icon.value === selectedIcon ? "fill-blue-500" : "fill-gray-400"
                                            )
                                        } />
                                    </div>
                                }
                            />
                        ))}
                    </Group>
                </Radio.Group>

                <Checkbox
                    disabled={true}
                    label="Apply to all instances"
                    checked={iconForAllInstances}
                    onChange={(event) => setIconForAllInstances(event.currentTarget.checked)}
                    className="mt-6"
                    size="xs"
                />

                <Flex mt={20} gap="xs">
                    <Button h={26} style={{ flex: 1 }} size='xs' onClick={onSave}>
                        Save
                    </Button>
                    <Button h={26} style={{ flex: 1 }} size='xs' color="gray" onClick={() => {
                        close();
                    }}>
                        Cancel
                    </Button>
                </Flex>
            </Modal.Body>
        </Modal>
    </Container>
}
