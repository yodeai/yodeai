

import { useCallback, MutableRefObject, useMemo } from 'react';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { Tables } from 'app/_types/supabase';
import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { buildDataTable } from '../utils'

type PluginParams = {
    $spreadsheet: MutableRefObject<SpreadsheetComponent>;
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    };
}

export default ({ $spreadsheet, spreadsheet }: PluginParams) => {
    const { dataSource, plugin } = spreadsheet;

    const dataTable = useMemo(() => buildDataTable(dataSource), [dataSource]);
    const onCreated = useCallback(() => {

    }, []);

    return {
        onCreated,
        dataTable,
        isProtected: false
    };
};
