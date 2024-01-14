"use client";

import React, { useState, useContext, createContext, createRef } from 'react';
import Explorer from '@components/Explorer';
import { useDisclosure } from '@mantine/hooks';
import { ExplorerConfiguration, ExplorerItemType } from '@lib/types';

type contextType = {
    modal: {
        sourceRef: React.MutableRefObject<string>,
        opened: boolean;
        actions: ReturnType<typeof useDisclosure>["1"],
        config: ExplorerConfiguration,
        openWithConfiguration: (config: ExplorerConfiguration) => void;
    },
    selectedItems: ExplorerItemType[],
    setSelectedItems: React.Dispatch<React.SetStateAction<ExplorerItemType[]>>;
}
type ExplorerProps = {
    children: React.ReactNode;
}

const $sourceRef: React.MutableRefObject<string> = createRef();
const defaultValues: contextType = {
    modal: {
        opened: false,
        actions: {
            open: () => { },
            close: () => { },
            toggle: () => { },
        },
        config: {
            multiple: false,
        },
        sourceRef: $sourceRef,
        openWithConfiguration: (config: ExplorerConfiguration) => { }
    },
    selectedItems: [],
    setSelectedItems: () => { }
}

const context = createContext<contextType>(defaultValues);

export const useExplorer = () => {
    return useContext(context);
};

const ExplorerProvider: React.FC<ExplorerProps> = ({ children }) => {
    const [opened, actions] = useDisclosure(defaultValues.modal.opened);
    const [config, setConfig] = useState<ExplorerConfiguration>(defaultValues.modal.config);

    const [selectedItems, setSelectedItems] = useState<ExplorerItemType[]>();

    const openWithConfiguration = ({ sourceRef, ...config }: ExplorerConfiguration) => {
        setConfig(cfg => ({ ...cfg, ...config }));
        $sourceRef.current = sourceRef.current;
        actions.open();
    }

    const providerValue = {
        modal: {
            opened,
            actions,
            config,
            openWithConfiguration,
            sourceRef: $sourceRef
        },
        selectedItems,
        setSelectedItems,
    }

    return <context.Provider value={providerValue}>
        <Explorer
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
        />
        {children}
    </context.Provider>

}

export default ExplorerProvider;