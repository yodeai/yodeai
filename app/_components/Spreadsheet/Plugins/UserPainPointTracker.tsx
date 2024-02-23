

import { useCallback, useMemo } from 'react';
import { ColumnDirective, ColumnsDirective, SheetDirective } from '@syncfusion/ej2-react-spreadsheet';
import { convertDataSource, convertIndexToColumnAlphabet } from '../utils';
import { PluginInput, PluginOutput } from './index';
import {
    SheetsDirective
} from '@syncfusion/ej2-react-spreadsheet';
import { SpreadsheetDataSource, SpreadsheetDataSourceObject } from 'app/_types/spreadsheet';
import { useSheetChart, useSheetData, useSheetRange } from '../hooks';

export default function ({ $spreadsheet, $dataSource, spreadsheet }: PluginInput): PluginOutput {
    const dataSource = useMemo<SpreadsheetDataSourceObject>(() => {
        if (Array.isArray($dataSource.current)) {
            console.log('Rendering legacy structure to new structure', $dataSource.current);
            const renderedDataSource = convertDataSource.arrayToObject($dataSource.current as SpreadsheetDataSource);
            $dataSource.current = renderedDataSource;
            return renderedDataSource;
        }

        return $dataSource.current;
    }, [$dataSource.current]);

    const cumulativeDataSource = useMemo<SpreadsheetDataSourceObject>(() => {
        return Object.entries(dataSource)
            .reduce((cumulativeData, [rowIndex, cols]) => {
                if (!cumulativeData[rowIndex]) cumulativeData[rowIndex] = {};

                let sum = 0;
                Object.entries(cols).forEach(([colIndex, value]) => {
                    if (colIndex === '0' || rowIndex === '0') {
                        cumulativeData[rowIndex][colIndex] = value;
                    } else {
                        sum += Number(value.value);
                        cumulativeData[rowIndex][colIndex] = Number(sum);
                    }
                });
                return cumulativeData;
            }, {});
    }, [dataSource]);

    const onCreated = useCallback(() => {
        if (!$spreadsheet.current) return;
        $spreadsheet.current.hideRibbonTabs(['Insert', 'Data', 'View', 'Formulas', 'Chart Design']);
        $spreadsheet.current.hideFileMenuItems(['Save As'], false)
        onSheetChanged();
    }, [$dataSource.current]);

    const sheetChart = useSheetChart({ dataSource });
    const sheetContent = useSheetData({ dataSource, chart: sheetChart });

    const sheetCumulativeChart = useSheetChart({ dataSource: cumulativeDataSource });
    const sheetCumulativeContent = useSheetData({ dataSource: cumulativeDataSource, chart: sheetCumulativeChart });

    const sheetPosition = useSheetRange(dataSource);

    const onSheetChanged = useCallback(() => {
        if (!$spreadsheet.current) return;

        setTimeout(() => {
            $spreadsheet.current.cellFormat({
                backgroundColor: '#e56590',
                color: '#fff',
                textAlign: 'center',
                fontFamily: 'Arial'
            }, `A1:${convertIndexToColumnAlphabet(sheetPosition.colIndex - 1)}1`);
            $spreadsheet.current.cellFormat({
                backgroundColor: '#fff',
                color: '#228be6',
                fontFamily: 'Arial'
            }, `A2':A${sheetPosition.rowIndex}`);
            $spreadsheet.current.deselectChart();
        }, 100)
    }, [spreadsheet.dataSource]);

    const document = <SheetsDirective>
        <SheetDirective name='Pain Points'>
            {sheetContent}
            <ColumnsDirective>
                {Array.from({ length: sheetPosition.colIndex }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 104} key={i} />)}
            </ColumnsDirective>
        </SheetDirective>

        <SheetDirective name='Cumulative'>
            {sheetCumulativeContent}

            <ColumnsDirective>
                {Array.from({ length: sheetPosition.colIndex }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 104} key={i} />)}
            </ColumnsDirective>
        </SheetDirective>
    </SheetsDirective>;

    return {
        onCreated,
        beforeDataBound: onSheetChanged,
        isProtected: false,
        document
    };
};
