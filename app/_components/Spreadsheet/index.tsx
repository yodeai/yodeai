"use client";

import { useState, useMemo, useRef, useCallback } from 'react';
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

import { SpreadsheetColumns, SpreadsheetDataSource } from 'app/_types/spreadsheet';
import { buildDataSource } from './utils'

type SpreadsheetProps = {
    columns: SpreadsheetColumns
    dataSource: SpreadsheetDataSource;
}

const Spreadsheet = (props: SpreadsheetProps) => {
    const [dataSource, setDataSource] = useState(buildDataSource(props.columns, props.dataSource));

    const $spreadsheet = useRef<SpreadsheetComponent>()
    const chart: ChartModel[] = useMemo(() => {
        return [{ type: 'Column', range: 'A1:E8' }]
    }, []);

    const onCreated = useCallback(() => {
        $spreadsheet.current.cellFormat({ backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center' }, 'A1:E1');
        $spreadsheet.current.numberFormat(getFormatFromType('Currency'), 'B1:E8');
        $spreadsheet.current.merge('A1:E1');
    }, [])

    const onCellSave = useCallback((saveEventArg: CellSaveEventArgs) => {
        console.log(saveEventArg);
    }, [])

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent
                    saveComplete={onCellSave}
                    ref={$spreadsheet}
                    created={onCreated.bind(this)}>
                    <SheetsDirective>
                        <SheetDirective name='GDP'>
                            <RowsDirective>
                                <RowDirective index={2}>
                                    <CellsDirective>
                                        <CellDirective index={6} chart={chart}></CellDirective>
                                    </CellsDirective>
                                </RowDirective>
                            </RowsDirective>
                            <RangesDirective>
                                <RangeDirective dataSource={dataSource} startCell='A1'></RangeDirective>
                            </RangesDirective>
                            <ColumnsDirective>
                                <ColumnDirective width={80}></ColumnDirective>
                                <ColumnDirective width={75}></ColumnDirective>
                                <ColumnDirective width={75}></ColumnDirective>
                                <ColumnDirective width={75}></ColumnDirective>
                                <ColumnDirective width={75}></ColumnDirective>
                            </ColumnsDirective>
                        </SheetDirective>
                    </SheetsDirective>
                </SpreadsheetComponent>
            </div>
        </div>
    )
}

export default Spreadsheet;