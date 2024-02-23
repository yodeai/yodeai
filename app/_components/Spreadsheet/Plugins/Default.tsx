

import { useCallback, useMemo } from 'react';
import { buildDataTable } from '../utils'
import { PluginInput, PluginOutput } from './index';
import { SheetsDirective, SheetDirective } from '@syncfusion/ej2-react-spreadsheet';

export default ({ $spreadsheet, spreadsheet }: PluginInput): PluginOutput => {
    const { dataSource, plugin } = spreadsheet;

    const onCreated = useCallback(() => {
        if (!$spreadsheet.current) return;
        $spreadsheet.current.hideRibbonTabs(['Home', 'Insert', 'Data', 'View', 'Formulas', 'Chart Design']);
    }, []);

    const dataTable = useMemo(() => buildDataTable(dataSource), [dataSource]);
    const document = <SheetsDirective>
        <SheetDirective name='Default'>
        </SheetDirective>
    </SheetsDirective>

    return {
        dataTable,
        document,
        onCreated
    };
};
