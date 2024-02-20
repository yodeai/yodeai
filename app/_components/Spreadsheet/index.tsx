"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import './styles/styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);

import { Database, Tables } from 'app/_types/supabase';
import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import usePlugin from './Plugins';
import SpreadsheetHeader from './Header';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type SpreadsheetProps = {
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    }
}

const Spreadsheet = (props: SpreadsheetProps) => {
    const supabase = createClientComponentClient<Database>();
    const [spreadsheet, setSpreadsheet] = useState<SpreadsheetProps["spreadsheet"]>(props.spreadsheet);

    const useSpreadsheetPlugin = usePlugin(spreadsheet?.plugin?.name);
    const $spreadsheet = useRef<SpreadsheetComponent>();
    const $container = useRef<HTMLDivElement>();
    const router = useRouter();

    const onHandleResize = useCallback(() => {
        const eSheetPanel = $container.current.querySelector<HTMLDivElement>('.e-sheet-panel');
        if (!eSheetPanel) return;

        console.log("Container height", $container.current.clientHeight, "Sheet panel height", eSheetPanel.style.height)
        eSheetPanel.style.height = `${$container.current.clientHeight - 160}px`;
    }, [$spreadsheet, $container]);

    useEffect(() => {
        onHandleResize();
        $container.current?.addEventListener('resize', onHandleResize);
        return () => {
            $container.current?.removeEventListener('resize', onHandleResize);
        }
    }, [$container]);

    const updateSpreadsheet = useCallback((payload) => {
        setSpreadsheet((prev) => {
            return {
                ...prev,
                ...payload.new
            }
        })
    }, []);

    useEffect(() => {
        console.log("Subscribing to spreadsheet changes.")
        const channel = supabase
            .channel('schema-db-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'spreadsheet', filter: `spreadsheet_id=eq.${spreadsheet.spreadsheet_id}` }, updateSpreadsheet)
            .subscribe();

        return () => {
            if (channel) {
                channel.unsubscribe();
                console.log("Unsubscribed from spreadsheet changes.")
            }
        };
    }, [spreadsheet.spreadsheet_id]);

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

    const {
        onCreated = () => { },
        onSheetChanged = () => { },
        document,
        isProtected = false
    } = useSpreadsheetPlugin({ $spreadsheet, spreadsheet });

    return (
        <div className='root-spreadsheet control-pane h-full overflow-hidden'>
            <SpreadsheetHeader
                title={spreadsheet.name}
                accessType={"editor"}
                onSave={handleSaveTitle}
                onDelete={handleDelete}
            />
            <div ref={$container} className='control-section spreadsheet-control !h-full p-2'>
                <SpreadsheetComponent
                    beforeDataBound={onSheetChanged}
                    isProtected={isProtected}
                    created={onCreated.bind(this)}
                    ref={$spreadsheet}>
                    {document}
                </SpreadsheetComponent>
            </div>
        </div >
    )
}

export default Spreadsheet;