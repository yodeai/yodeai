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
import SpreadsheetHeader from './Header';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useDebouncedCallback } from '@utils/hooks';
import { convertDataSource } from './utils';
import { ImSpinner8 } from 'react-icons/im';
import { Text } from '@mantine/core';
import { useAppContext } from '@contexts/context';

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
        return fetch(`/api/spreadsheet/${spreadsheet.spreadsheet_id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
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
            setIsSaving(false);
        });
    }, 1000, []);

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

    const spreadsheetContainer = useMemo(() => <div ref={$container} className='control-section spreadsheet-control !h-full p-2'>
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

    return (
        <div className='root-spreadsheet control-pane h-full overflow-hidden'>
            <SpreadsheetHeader
                title={spreadsheet.name}
                accessType={access_type}
                onSave={handleSaveTitle}
                onDelete={handleDelete}
                rightSection={<>
                    {isSaving && <div className="flex flex-row items-center gap-2">
                        <ImSpinner8 size={14} className="animate-spin" />
                        <Text size="sm" c="gray.7" m={0} p={0}>Auto-save...</Text>
                    </div> || ""}
                </>}
            />
            {spreadsheetContainer}
        </div >
    )
}

export default Spreadsheet;