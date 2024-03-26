"use client";

import { Lens } from "app/_types/lens";
import { useState, useEffect, useMemo, useCallback } from "react";
import load from "@lib/load";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Flex, Box } from "@mantine/core";

import LayoutController from '@components/Layout/LayoutController';
import { LensLayout } from "app/_types/lens";
import { useAppContext } from "@contexts/context";
import { getLayoutViewFromLocalStorage, setLayoutViewToLocalStorage } from "@utils/localStorage";

import { Database } from "app/_types/supabase";
import FinishedOnboardingModal from "@components/Onboarding/FinishedOnboardingModal";

import { PageHeader } from "@components/Layout/PageHeader";
import { Sort } from "@components/Layout/PageHeader/Sort";
import { LayoutSwitcher } from "@components/Layout/PageHeader/LayoutSwitcher";
import { Zoom } from "@components/Layout/PageHeader/Zoom";
import { PageContent } from "@components/Layout/Content";
import { useProgressRouter } from "app/_hooks/useProgressRouter";

const supabase = createClientComponentClient<Database>()

type HomePageProps = {
    lenses: Lens[];
    layoutData: LensLayout;
}

export default function HomePage(props: HomePageProps) {
    const [lenses, setLenses] = useState<(Lens)[]>(props.lenses);
    const [layoutData, setLayoutData] = useState<LensLayout>(props.layoutData);
    const router = useProgressRouter();

    const {
        sortingOptions, setSortingOptions, setLensId, setLensName,
        zoomLevel, setZoomLevel
    } = useAppContext();
    const defaultSelectedLayoutType = getLayoutViewFromLocalStorage("default_layout") || "icon";
    const [selectedLayoutType, setSelectedLayoutType] = useState<"block" | "icon">(defaultSelectedLayoutType);

    useEffect(() => {
        setLensId(null);
        setLensName(null);
    }, []);

    const onChangeLensLayout = async (layoutName: keyof LensLayout, layoutData: LensLayout[keyof LensLayout]) => {
        // saveLayoutToSupabase(layoutName, layoutData)
        setLayoutData(prevLayout => ({
            ...prevLayout,
            [layoutName]: layoutData
        }))
    };

    const handleBlockChangeName = async (block_id: number, newBlockName: string) => {
        const updatePromise = fetch(`/api/block/${block_id}`, {
            method: "PUT",
            body: JSON.stringify({ title: newBlockName }),
        });

        return load<Response>(updatePromise, {
            loading: "Updating page name...",
            success: "Page name updated!",
            error: "Failed to update page name.",
        }).then(res => {
            router.revalidate();
            return res;
        })
    }

    const handleBlockDelete = (block_id: number) => {
        const deletePromise = fetch(`/api/block/${block_id}`, {
            method: "DELETE"
        });
        return load(deletePromise, {
            loading: "Deleting page...",
            success: "Page deleted!",
            error: "Failed to delete page.",
        }).then(res => {
            router.revalidate();
            return res;
        })
    }

    const handleLensDelete = async (lens_id: number) => {
        const deletePromise = fetch(`/api/lens/${lens_id}`, { method: "DELETE" });
        return load(deletePromise, {
            loading: "Deleting space...",
            success: "Space deleted!",
            error: "Failed to delete space.",
        }).then(res => {
            router.revalidate();
            return res;
        })
    }

    const handleChangeLayoutView = (newLayoutView: "block" | "icon") => {
        setLayoutViewToLocalStorage("default_layout", newLayoutView)
        setSelectedLayoutType(newLayoutView)
    }

    const addSubspaces = useCallback((payload) => {
        let lens_id = payload["new"]["lens_id"]
        console.log("Added a subspace", lens_id)
        let newSubspace = payload["new"]
        if (!lenses.some(item => item.lens_id === lens_id)) {
            setLenses(prevSubspaces => [newSubspace, ...prevSubspaces]);
        }
        router.revalidate();
    }, [lenses]);

    const deleteSubspace = useCallback((payload) => {
        let lens_id = payload["old"]["lens_id"]
        console.log("Deleting space", payload);
        setLenses((prevSubspaces) => prevSubspaces.filter((subspace) => subspace.lens_id !== lens_id))
        router.revalidate();
    }, []);

    const handleLensChangeName = async (lens_id: number, newLensName: string) => {
        const updatePromise = fetch(`/api/lens/${lens_id}`, {
            method: "PUT",
            body: JSON.stringify({ name: newLensName }),
        });

        return load<Response>(updatePromise, {
            loading: "Updating space name...",
            success: "Space name updated!",
            error: "Failed to update space name.",
        }).then(res => {
            router.revalidate();
            return res;
        })
    }

    useEffect(() => {
        if (!getLayoutViewFromLocalStorage("default_layout")) {
            setLayoutViewToLocalStorage("default_layout", "icon")
        }

        const channel = supabase.channel('schema_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lens', filter: `parent_id=eq.${-1}` }, addSubspaces)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lens', filter: `parent_id=eq.${-1}` }, deleteSubspace)
            .subscribe();

        return () => {
            console.log("Unsubscribing from space changes")
            if (channel) {
                channel.unsubscribe();
            }
        }
    }, [])

    const sortedLenses = useMemo(() => {
        if (sortingOptions.sortBy === null) return lenses;

        let _sorted_lenses = [...lenses].sort((a, b) => {
            if (sortingOptions.sortBy === "name") {
                return a.name.localeCompare(b.name);
            } else if (sortingOptions.sortBy === "createdAt") {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortingOptions.sortBy === "updatedAt") {
                return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });

        if (sortingOptions.order === "desc") {
            _sorted_lenses = _sorted_lenses.reverse();
        }

        return _sorted_lenses;
    }, [sortingOptions, lenses]);

    const headerActions = useMemo(() => {
        return <Box className="flex flex-row items-center align-middle">
            <Sort sortingOptions={sortingOptions} setSortingOptions={setSortingOptions} />
            <LayoutSwitcher selectedLayoutType={selectedLayoutType} handleChangeLayoutView={handleChangeLayoutView} />
            <Zoom zoomLevel={zoomLevel} setZoomLevel={val => setZoomLevel(val, "default")} />
        </Box>
    }, [
        sortingOptions,
        selectedLayoutType,
        zoomLevel
    ])

    return (
        <Flex direction="column" pt={0} h="100%">
            <PageHeader
                title="Home"
                actions={headerActions}
            />
            <PageContent>
                <Box className="flex items-stretch flex-col h-full">
                    <LayoutController
                        itemIcons={{}}
                        subspaces={sortedLenses}
                        layout={layoutData}
                        layoutView={selectedLayoutType}
                        handleBlockChangeName={handleBlockChangeName}
                        handleBlockDelete={handleBlockDelete}
                        handleLensDelete={handleLensDelete}
                        handleLensChangeName={handleLensChangeName}
                        onChangeLayout={onChangeLensLayout}
                    />
                </Box>
            </PageContent>
            <FinishedOnboardingModal />
        </Flex >
    );
}