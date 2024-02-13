"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

import { EmitType, registerLicense } from '@syncfusion/ej2-base';
import {
    SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective,
    getFormatFromType, ChartModel, BeforeCellUpdateArgs,
    ColumnDirective, RowDirective, RowsDirective,
    CellsDirective, CellDirective, RangesDirective, RangeDirective
} from '@syncfusion/ej2-react-spreadsheet';
import './styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);


import { ImSpinner8 } from "react-icons/im";
import { Tables } from 'app/_types/supabase';
import { Text } from '@mantine/core';

import { SpreadsheetCell, SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { buildDataTable, convertIndexToColumnAlphabet } from './utils'
import { useDebouncedCallback } from '@utils/hooks';

type SpreadsheetProps = {
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    }
}

const Spreadsheet = ({ spreadsheet: { dataSource, plugin, spreadsheet_id } }: SpreadsheetProps) => {
    const [cells, setCells] = useState(dataSource);
    const $spreadsheet = useRef<SpreadsheetComponent>()
    const $mounted = useRef<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const chart: ChartModel[] = useMemo(() => {
        return [{ type: 'Column', range: 'A1:E8' }]
    }, [cells]);

    const { columns, records } = useMemo(() => buildDataTable(cells), [cells]);
    const isProtected = Boolean(plugin?.name);

    const onCreated = useCallback(() => {
        if (columns.length === 0) { return; }
        $spreadsheet.current.protectSheet();
        $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas']);
        
        $spreadsheet.current.cellFormat({
            backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center'
        }, `A1:${convertIndexToColumnAlphabet(columns.length - 1)}1`);
        $spreadsheet.current.numberFormat(getFormatFromType('Currency'), `B1:E8`);
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
                                <RowsDirective>
                                    <RowDirective index={2}>
                                        <CellsDirective>
                                            <CellDirective index={columns.length + 1} chart={chart}></CellDirective>
                                        </CellsDirective>
                                    </RowDirective>
                                </RowsDirective>
                            }
                            {plugin?.state?.status === "success" &&
                                <ColumnsDirective>
                                    {Array.from({ length: columns.length }, (_, i) => <ColumnDirective width={75} key={i} />)}
                                </ColumnsDirective>}
                        </SheetDirective>
                    </SheetsDirective>
                </SpreadsheetComponent>
            </div>
        </div >
    )
}

export default Spreadsheet;