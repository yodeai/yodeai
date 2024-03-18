"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmitType, registerLicense } from '@syncfusion/ej2-base';
import { BeforeCellUpdateArgs, SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './styles/styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);

import { Database, Tables } from 'app/_types/supabase';
import { SpreadsheetDataSourceObject, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import usePlugin from './Plugins';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useDebouncedCallback } from 'app/_hooks/useDebouncedCallback';
import { ImSpinner8 } from '@react-icons/all-files/im/ImSpinner8';

import { Box, Text } from '@mantine/core';
import { useAppContext } from '@contexts/context';
import { PageHeader } from '@components/Layout/PageHeader';
import { modals } from '@mantine/modals';
import load from '@lib/load';
import { PageContent } from '@components/Layout/Content';
import { revalidateRouterCache } from '@utils/revalidate';

type SpreadsheetProps = {
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSourceObject;
        plugin: SpreadsheetPluginParams
    }
    access_type: "owner" | "editor" | "reader"
}

const Spreadsheet = ({ spreadsheet: _spreadsheet, access_type }: SpreadsheetProps) => {
    const supabase = createClientComponentClient<Database>();
    const [spreadsheet, setSpreadsheet] = useState<SpreadsheetProps["spreadsheet"]>(_spreadsheet);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { setBreadcrumbActivePage, setLensId } = useAppContext();

    const useSpreadsheetPlugin = usePlugin(spreadsheet?.plugin?.name);
    const $spreadsheet = useRef<SpreadsheetComponent>();
    const $container = useRef<HTMLDivElement>();
    const router = useRouter();
    const $dataSource = useRef<SpreadsheetDataSourceObject>(spreadsheet.dataSource);

    const isSpreadsheetProtected = useMemo(() => {
        if (["owner", "editor"].includes(access_type)) return false;
        return true;
    }, [access_type]);


    const onHandleResize = useCallback(() => {
        const eSheetPanel = $container.current.querySelector<HTMLDivElement>('.e-sheet-panel');
        if (!eSheetPanel) return;

        eSheetPanel.style.height = `${$container.current.clientHeight + (isSpreadsheetProtected ? 35 : 15)}px`;
    }, [$spreadsheet, $container, isSpreadsheetProtected]);

    useEffect(() => {
        onHandleResize();
        $container.current?.addEventListener('resize', onHandleResize);
        return () => {
            $container.current?.removeEventListener('resize', onHandleResize);
        }
    }, [$container]);

    const handleUpdateSpreadsheet = useCallback((payload) => {
        if (payload.new.name === spreadsheet.name) return;
        setSpreadsheet((prev) => ({ ...prev, name: payload.new.name }))
        revalidateRouterCache(`/spreadsheet/${spreadsheet.spreadsheet_id}`);
    }, []);

    useEffect(() => {
        console.log("Subscribing to spreadsheet changes.")
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'spreadsheet', filter: `spreadsheet_id=eq.${spreadsheet.spreadsheet_id}` }, handleUpdateSpreadsheet)
            .subscribe();

        return () => {
            if (channel) {
                channel.unsubscribe();
                console.log("Unsubscribed from spreadsheet changes.")
            }
        };
    }, [spreadsheet.spreadsheet_id]);

    useEffect(() => {
        setLensId(spreadsheet.lens_id.toString())
        setBreadcrumbActivePage({ title: spreadsheet.name, href: `/spreadsheet/${spreadsheet.spreadsheet_id}` })

        return () => {
            setBreadcrumbActivePage(null);
        }
    }, [spreadsheet])

    const handleSaveTitle = async (name: string) => {
        const savePromise = fetch(`/api/spreadsheet/${spreadsheet.spreadsheet_id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await load(savePromise, {
            loading: "Changing name...",
            success: "Name changed.",
            error: "Failed to change name."
        });
        setIsEditing(false);
    }

    const handleDelete = async () => {
        return fetch(`/api/spreadsheet/${spreadsheet.spreadsheet_id}`, {
            method: 'DELETE'
        }).finally(() => {
            router.push(`/lens/${spreadsheet.lens_id}`);
        })
    }

    const syncSpreadsheetData = useDebouncedCallback((dataSource: SpreadsheetDataSourceObject) => {
        setIsSaving(true);
        return fetch(`/api/spreadsheet/${spreadsheet.spreadsheet_id}`, {
            method: 'PUT',
            body: JSON.stringify({ dataSource }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).finally(() => {
            revalidateRouterCache(`/spreadsheet/${spreadsheet.spreadsheet_id}`);
            setIsSaving(false);
        });
    }, 1000, []);

    const openDeleteModal = () => modals.openConfirmModal({
        title: 'Confirm spreadsheet deletion',
        centered: true,
        confirmProps: { color: 'red' },
        children: (
            <Text size="sm">
                Are you sure you want to delete this spreadsheet? This action cannot be undone.
            </Text>
        ),
        labels: { confirm: 'Delete spreadsheet', cancel: "Cancel" },
        onCancel: () => console.log('Canceled deletion'),
        onConfirm: () => {
            const deletePromise = handleDelete();
            load(deletePromise, {
                loading: "Deleting spreadsheet...",
                success: "Spreadsheet deleted.",
                error: "Failed to delete spreadsheet."
            }).then(() => {
                router.back();
            })
        }
    });

    const onCellUpdate: EmitType<BeforeCellUpdateArgs> = useCallback(({ rowIndex, colIndex, cell }: BeforeCellUpdateArgs) => {
        let currentDataSource = $dataSource.current;

        const newCell = Object.assign({}, currentDataSource?.[rowIndex]?.[colIndex] || {}, cell);
        currentDataSource = {
            ...currentDataSource,
            [rowIndex]: {
                ...currentDataSource[rowIndex],
                [colIndex]: newCell
            }
        }

        if (cell.value === "") delete currentDataSource[rowIndex][colIndex];
        if (Object.keys(currentDataSource[rowIndex]).length === 0) delete currentDataSource[rowIndex];

        $dataSource.current = currentDataSource;
        syncSpreadsheetData(currentDataSource);
    }, []);


    const {
        onCreated = () => { },
        beforeDataBound = () => { },
        document
    } = useSpreadsheetPlugin({ $spreadsheet, $dataSource, access_type });


    const onSheetCreated = useCallback(function () {
        onCreated.bind(this).call();

        if (["owner", "editor"].includes(access_type) === false) {
            $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas', 'Chart Design']);
            $spreadsheet.current.protectSheet();
        }
    }, [access_type, $spreadsheet])

    const spreadsheetContainer = useMemo(() =>
        <div ref={$container} className='control-section spreadsheet-control !h-full p-2'>
            <SpreadsheetComponent
                saveUrl='https://services.syncfusion.com/react/production/api/spreadsheet/save'
                beforeCellUpdate={onCellUpdate}
                beforeDataBound={beforeDataBound}
                created={onSheetCreated.bind(this)}
                isProtected={isSpreadsheetProtected}
                ref={$spreadsheet}>
                {document}
            </SpreadsheetComponent>
        </div>, []);

    const headerActions = useMemo(() => {
        return <>{
            isSaving && <div className="flex flex-row align-middle gap-2">
                <ImSpinner8 size={14} className="animate-spin" />
                <Text size="sm" c="gray.7" m={0} p={0}>Auto-save...</Text>
            </div> || ""
        }</>
    }, [isSaving]);

    const headerDropdownItems = useMemo(() => {
        return [
            {
                label: "Rename",
                onClick: () => setIsEditing(true),
                disabled: !["owner", "editor"].includes(access_type)
            },
            {
                label: "Delete",
                onClick: openDeleteModal,
                disabled: !["owner", "editor"].includes(access_type),
                color: "red"
            }
        ]
    }, [])

    return <Box className="flex flex-col justify-between align-middle">
        <PageHeader
            title={spreadsheet.name}
            editMode={isEditing}
            onSaveTitle={handleSaveTitle}
            actions={headerActions}
            dropdownItems={headerDropdownItems}
        />
        <PageContent>
            {spreadsheetContainer}
        </PageContent>
    </Box>
}

export default Spreadsheet;