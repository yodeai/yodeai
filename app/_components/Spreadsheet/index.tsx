"use client";

import { useState } from 'react';

import {
    SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective,
    getFormatFromType, CellStyleModel, ChartModel, CellSaveEventArgs
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

import Data from './chart.json';

const Spreadsheet = () => {
    const [dataSource, setDataSource] = useState(Data.GDPData);

    let spreadsheet: SpreadsheetComponent;
    const style: CellStyleModel = {
        backgroundColor: '#e56590', color: '#fff',
        fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle'
    };

    const chart: ChartModel[] = [{ type: 'Column', range: 'A1:E8' }];

    function onCreated(): void {
        spreadsheet.cellFormat({ backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center' }, 'A1:E1');
        spreadsheet.numberFormat(getFormatFromType('Currency'), 'B1:E8');
        spreadsheet.merge('A1:E1');
    }

    function onCellSave(saveEventArg: CellSaveEventArgs) {
        console.log(saveEventArg);
    }

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent
                    saveComplete={onCellSave}
                    ref={(ssObj) => { spreadsheet = ssObj }}
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