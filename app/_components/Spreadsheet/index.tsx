"use client";

import { useState, useMemo, useRef, useCallback } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);

import {
    SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective,
    getFormatFromType, ChartModel, CellSaveEventArgs
} from '@syncfusion/ej2-react-spreadsheet';
import {
    ColumnDirective, RowDirective, RowsDirective,
    CellsDirective, CellDirective
} from '@syncfusion/ej2-react-spreadsheet';
import { RangeDirective } from '@syncfusion/ej2-react-spreadsheet';
import { RangesDirective } from '@syncfusion/ej2-react-spreadsheet';

import './styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

import { SpreadsheetColumns, SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { buildDataSource, convertIndexToColumnAlphabet } from './utils'

type SpreadsheetProps = {
    columns: SpreadsheetColumns;
    dataSource: SpreadsheetDataSource;
    plugin: SpreadsheetPluginParams;
}

const Spreadsheet = ({ columns, dataSource: _dataSource, plugin }: SpreadsheetProps) => {
    const [dataSource, setDataSource] = useState(buildDataSource(columns, _dataSource));

    const $spreadsheet = useRef<SpreadsheetComponent>()
    const chart: ChartModel[] = useMemo(() => {
        return [{ type: 'Column', range: 'A1:E8' }]
    }, []);

    const onCreated = useCallback(() => {
        $spreadsheet.current.cellFormat({
            backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center'
        }, `A1:${convertIndexToColumnAlphabet(columns.length - 1)}1`);
        $spreadsheet.current.numberFormat(getFormatFromType('Currency'), 'B1:E8');
    }, [columns])

    const onCellSave = useCallback((saveEventArg: CellSaveEventArgs) => {
        console.log(saveEventArg);
    }, []);

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent
                    saveComplete={onCellSave}
                    created={onCreated.bind(this)}
                    ref={$spreadsheet}>
                    <SheetsDirective>
                        <SheetDirective name='GDP'>
                            <RangesDirective>
                                <RangeDirective dataSource={dataSource} startCell='A1'></RangeDirective>
                            </RangesDirective>
                            {plugin.state.status === "success" &&
                                <RowsDirective>
                                    <RowDirective index={2}>
                                        <CellsDirective>
                                            <CellDirective index={columns.length + 1} chart={chart}></CellDirective>
                                        </CellsDirective>
                                    </RowDirective>
                                </RowsDirective>
                            }
                            {plugin.state.status === "success" &&
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