import {
    MutableRefObject
} from 'react';

import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { Tables } from 'app/_types/supabase';
import { SpreadsheetDataTable } from 'app/_types/spreadsheet';
import Default from './Default';
import UserPainPointTracker from './UserPainPointTracker';

export type PluginFunction = (
    {
        $spreadsheet,
        spreadsheet,
    }: {
        $spreadsheet: MutableRefObject<SpreadsheetComponent>;
        spreadsheet: Tables<"spreadsheet"> & {
            dataSource: SpreadsheetDataSource;
            plugin: SpreadsheetPluginParams;
        };
    }
) => {
    onCreated: () => void;
    dataTable: SpreadsheetDataTable;
    isProtected: boolean;
};

const PluginMap: {
    [key: string]: PluginFunction
} = {
    Default,
    "pain-point-tracker": UserPainPointTracker
};

export default (pluginName: string) => {
    return PluginMap[pluginName] || Default;
}