import { MutableRefObject } from 'react';

import { BeforeCellUpdateArgs, SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { SpreadsheetDataSource, SpreadsheetDataSourceObject, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import { Tables } from 'app/_types/supabase';
import { SpreadsheetDataTable } from 'app/_types/spreadsheet';
import Default from './Default';
import UserPainPointTracker from './UserPainPointTracker';
import { EmitType } from '@syncfusion/ej2-base';

export type PluginInput = {
    $spreadsheet: MutableRefObject<SpreadsheetComponent>;
    $dataSource: MutableRefObject<SpreadsheetDataSourceObject>;
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSourceObject;
        plugin: SpreadsheetPluginParams
    };
    access_type: "owner" | "editor" | "reader"
}

export type PluginOutput = {
    document: JSX.Element;
    onCreated?: () => void;
    beforeDataBound?: EmitType<Object>;
    isProtected?: boolean;
}

export type PluginFunction = ({
    $spreadsheet,
    spreadsheet,
    $dataSource,
    access_type
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