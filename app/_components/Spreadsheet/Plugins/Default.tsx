

import { useCallback, useMemo } from 'react';
import { PluginInput, PluginOutput } from './index';
import {
    SheetsDirective, SheetDirective, RowDirective, RowsDirective,
    CellDirective, CellsDirective
} from '@syncfusion/ej2-react-spreadsheet';
import { useSheetData } from 'app/_components/Spreadsheet/hooks';

export default ({ $spreadsheet, $dataSource }: PluginInput): PluginOutput => {
    const dataSource = $dataSource.current;

    const onCreated = useCallback(() => {
        if (!$spreadsheet.current) return;
    }, []);

    const sheetContent = useSheetData({ dataSource });

    const document = <SheetsDirective>
        <SheetDirective name='Default'>
            {sheetContent}
        </SheetDirective>
    </SheetsDirective>

    return {
        document,
        onCreated
    };
};
