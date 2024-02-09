"use client";

import { } from 'react';

import { SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective, getFormatFromType, CellStyleModel, ChartModel } from '@syncfusion/ej2-react-spreadsheet';
import { ColumnDirective, RowDirective, RowsDirective, CellsDirective, CellDirective } from '@syncfusion/ej2-react-spreadsheet';
import { RangeDirective } from '@syncfusion/ej2-react-spreadsheet';
import { RangesDirective } from '@syncfusion/ej2-react-spreadsheet';
import './styles.css';
import Data from './chart.json';

const Spreadsheet = () => {
    let spreadsheet: SpreadsheetComponent;
    const style: CellStyleModel = {
        backgroundColor: '#e56590', color: '#fff',
        fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle'
    };
    const chart: ChartModel[] = [{ type: 'Column', range: 'A3:E10' }];
    function onCreated(): void {
        // Formatting cells dynamically using cellFormat method
        spreadsheet.cellFormat({ backgroundColor: '#e56590', color: '#fff', fontWeight: 'bold', textAlign: 'center' }, 'A3:E3');
        // Applying currency format to the specified range.
        spreadsheet.numberFormat(getFormatFromType('Currency'), 'B4:E10');
        // Merging the cells from A1 to E1
        spreadsheet.merge('A1:E1');
    }

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent ref={(ssObj) => { spreadsheet = ssObj }} created={onCreated.bind(this)}>
                    <SheetsDirective>
                        <SheetDirective name='GDP'>
                            <RowsDirective>
                                <RowDirective height={30}>
                                    <CellsDirective>
                                        <CellDirective value='Gross Domestic Product (in trillions)' style={style}></CellDirective>
                                    </CellsDirective>
                                </RowDirective>
                                <RowDirective>
                                    <CellsDirective>
                                        <CellDirective index={6} chart={chart}></CellDirective>
                                    </CellsDirective>
                                </RowDirective>
                            </RowsDirective>
                            <RangesDirective>
                                <RangeDirective dataSource={Data.GDPData} startCell='A3' ></RangeDirective>
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