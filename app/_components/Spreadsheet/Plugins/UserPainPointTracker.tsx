

import { useCallback, useMemo } from 'react';
import { ChartModel } from '@syncfusion/ej2-react-spreadsheet';
import { convertIndexToColumnAlphabet } from '../utils';
import { buildDataTable } from '../utils'

export default function ({ $spreadsheet, spreadsheet }) {
    const dataTable = useMemo(() => buildDataTable(spreadsheet.dataSource), [spreadsheet.dataSource]);

    const chart: ChartModel[] = useMemo<ChartModel[]>(() => {
        return [{
            type: "Line",
            theme: "Fabric",
            range: `A1:${convertIndexToColumnAlphabet(dataTable.columns.length)}${dataTable.records.length + 1}`,
            name: "Chart",
            width: dataTable.columns.length * 101,
            top: ((dataTable.records.length + 1) * 20) + 20,
            left: 230
        }]
    }, [dataTable]);

    const onCreated = useCallback(() => {
        $spreadsheet.current.protectSheet();
        $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas', 'Chart Design']);

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

        $spreadsheet.current.insertChart(chart);
        $spreadsheet.current.deselectChart();
    }, [dataTable]);

    return {
        onCreated,
        dataTable,
        isProtected: true
    };
};
