"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

import { registerLicense } from '@syncfusion/ej2-base';
import {
    SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective,
    ChartModel, ColumnDirective, RangesDirective, RangeDirective
} from '@syncfusion/ej2-react-spreadsheet';
import './styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);

import { ImSpinner8 } from "react-icons/im";
import { Tables } from 'app/_types/supabase';
import { Text } from '@mantine/core';

import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { buildDataTable, convertIndexToColumnAlphabet } from './utils'

type SpreadsheetProps = {
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    }
}

const Spreadsheet = ({ spreadsheet: { dataSource, plugin, spreadsheet_id } }: SpreadsheetProps) => {
    const table = buildDataTable(dataSource);

    const [cells, setCells] = useState(dataSource);
    const $spreadsheet = useRef<SpreadsheetComponent>()
    const $mounted = useRef<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const chart: ChartModel[] = useMemo<ChartModel[]>(() => {
        return [
            {
                type: "Line",
                theme: "Fabric",
                range: `A1:${convertIndexToColumnAlphabet(table.columns.length)}${table.records.length + 1}`,
                name: "Chart",
                width: table.columns.length * 101,
                top: ((table.records.length + 1) * 20) + 20,
                left: 230
            }
        ]
    }, [table]);

    const { columns, records } = useMemo(() => buildDataTable(cells), [cells]);
    const isProtected = Boolean(plugin?.name);

    const onCreated = useCallback(() => {
        if (columns.length === 0) { return; }

        $spreadsheet.current.protectSheet();
        $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas', 'Chart Design']);

        $spreadsheet.current.cellFormat({
            backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center'
        }, `A1:${convertIndexToColumnAlphabet(columns.length - 1)}1`);
        $spreadsheet.current.cellFormat({
            backgroundColor: '#ddd', color: '#000', fontWeight: 'bold', textAlign: 'center'
        }, `A2':A${table.records.length + 1}`);
        $spreadsheet.current.insertChart(chart);
        $spreadsheet.current.deselectChart();

        $mounted.current = true;
    }, [columns, plugin, isProtected]);
    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                {isLoading &&
                    <div className="absolute top-[70px] right-5 flex items-center gap-2 border border-gray-400 bg-gray-100 rounded-lg px-2 py-1">
                        <ImSpinner8 size={10} className="animate-spin" />
                        <Text size="sm" c="gray.7">Auto-save...</Text>
                    </div>}
                <SpreadsheetComponent
                    isProtected={true}
                    created={onCreated.bind(this)}
                    ref={$spreadsheet}>
                    <SheetsDirective>
                        <SheetDirective name='GDP'>
                            <RangesDirective>
                                <RangeDirective dataSource={records} startCell='A1'></RangeDirective>
                            </RangesDirective>
                            {plugin?.state?.status === "success" &&
                                <ColumnsDirective>
                                    {Array.from({ length: columns.length }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 100} key={i} />)}
                                </ColumnsDirective>}
                        </SheetDirective>
                    </SheetsDirective>
                </SpreadsheetComponent>
            </div>
        </div >
    )
}

export default Spreadsheet;