

import { useCallback, useMemo } from 'react';
import { CellDirective, CellsDirective, RowDirective, RowsDirective, SheetDirective } from '@syncfusion/ej2-react-spreadsheet';
import { convertIndexToColumnAlphabet } from '../utils';
import { buildDataTable } from '../utils'
import { PluginInput, PluginOutput } from './index';
import {
    SheetsDirective, ColumnsDirective, ChartModel,
    ColumnDirective, RangesDirective, RangeDirective
} from '@syncfusion/ej2-react-spreadsheet';

export default function ({ $spreadsheet, spreadsheet }: PluginInput): PluginOutput {
    const dataTable = useMemo(() => buildDataTable(spreadsheet.dataSource), [spreadsheet.dataSource]);

    const cumulativeDataTable = useMemo(() => {
        const cumulativeRecords = dataTable.records.map(record => {
            let cumulativeRecord = { ...record };
            let sum = 0;
            for (let i = 1; i < dataTable.columns.length; i++) {
                const column = dataTable.columns[i];
                sum += Number(record[column]);
                cumulativeRecord[column] = String(sum);
            }
            return cumulativeRecord;
        });
        return {
            columns: dataTable.columns,
            records: cumulativeRecords
        };
    }, [dataTable]);

    const chart: ChartModel[] = useMemo<ChartModel[]>(() => {
        return [{
            type: "Line", theme: "Fabric", name: "Chart",
            range: `A1:${convertIndexToColumnAlphabet(dataTable.columns.length-1)}${dataTable.records.length + 1}`,
            width: dataTable.columns.length * 101,
            top: ((dataTable.records.length + 1) * 20) + 20,
            left: 230,
            markerSettings: {
                shape: "Circle",
                size: 5,
                visible: true,
                border: {
                    width: 4
                }
            }
            
        }]
    }, [dataTable]);

    const cumulativeChart: ChartModel[] = useMemo<ChartModel[]>(() => {
        return [{
            type: "Line",
            theme: "Fabric",
            range: `A1:${convertIndexToColumnAlphabet(cumulativeDataTable.columns.length-1)}${cumulativeDataTable.records.length + 1}`,
            name: "Cumulative Chart",
            width: cumulativeDataTable.columns.length * 101,
            top: ((cumulativeDataTable.records.length + 1) * 20) + 20,
            left: 230
        }]
    }, [cumulativeDataTable]);

    const onCreated = useCallback(() => {
        if (!$spreadsheet.current) return;
        $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas', 'Chart Design']);
        onSheetChanged();
    }, [dataTable]);

    const onSheetChanged = useCallback(() => {
        if (!$spreadsheet.current) return;

        setTimeout(() => {
            $spreadsheet.current.protectSheet();
            $spreadsheet.current.cellFormat({
                backgroundColor: '#e56590',
                color: '#fff',
                textAlign: 'center',
                fontFamily: 'Arial'
            }, `A1:${convertIndexToColumnAlphabet(dataTable.columns.length - 1)}1`);
            $spreadsheet.current.cellFormat({
                backgroundColor: '#fff',
                color: '#228be6',
                fontFamily: 'Arial'
            }, `A2':A${dataTable.records.length + 1}`);
            $spreadsheet.current.deselectChart();
        }, 100)
    }, [dataTable]);

    const document = <SheetsDirective>
        <SheetDirective name='Pain Points'>
            <RangesDirective>
                <RangeDirective dataSource={dataTable.records} startCell='A1'></RangeDirective>
            </RangesDirective>
            <RowsDirective>
                <RowDirective index={2}>
                    <CellsDirective>
                        <CellDirective index={dataTable.columns.length + 1} chart={chart}></CellDirective>
                    </CellsDirective>
                </RowDirective>
            </RowsDirective>
            <ColumnsDirective>
                {Array.from({ length: dataTable.columns.length }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 104} key={i} />)}
            </ColumnsDirective>
        </SheetDirective>

        <SheetDirective name='Cumulative'>
            <RangesDirective>
                <RangeDirective dataSource={cumulativeDataTable.records} startCell='A1'></RangeDirective>
            </RangesDirective>
            <RowsDirective>
                <RowDirective index={2}>
                    <CellsDirective>
                        <CellDirective index={cumulativeDataTable.columns.length + 1} chart={cumulativeChart}></CellDirective>
                    </CellsDirective>
                </RowDirective>
            </RowsDirective>
            <ColumnsDirective>
                {Array.from({ length: dataTable.columns.length }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 104} key={i} />)}
            </ColumnsDirective>
        </SheetDirective>
    </SheetsDirective>;


    return {
        onCreated,
        onSheetChanged,
        dataTable,
        isProtected: true,
        document
    };
};
