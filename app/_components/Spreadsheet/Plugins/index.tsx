import { MutableRefObject } from 'react';

import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { Tables } from 'app/_types/supabase';
import { SpreadsheetDataTable } from 'app/_types/spreadsheet';
import Default from './Default';
import UserPainPointTracker from './UserPainPointTracker';

export type PluginInput = {
    $spreadsheet: MutableRefObject<SpreadsheetComponent>;
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    };
    access_type: "owner" | "editor" | "reader";
}

export type PluginOutput = {
    document: JSX.Element;
    dataTable: SpreadsheetDataTable;
    onCreated?: () => void;
    onSheetChanged?: () => void;
    isProtected?: boolean;
}

export type PluginFunction = ({
    $spreadsheet,
    spreadsheet,
}: PluginInput
) => PluginOutput;

const PluginMap: {
    [key: string]: PluginFunction
} = {
    Default,
    "pain-point-tracker": UserPainPointTracker
};

export default (pluginName: string) => {
    return PluginMap[pluginName] || Default;
}