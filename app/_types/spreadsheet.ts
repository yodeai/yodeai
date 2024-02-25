import { CellModel } from "@syncfusion/ej2-react-spreadsheet";

export type SpreadsheetDataSource = Array<SpreadsheetCell>;
export type SpreadsheetDataSourceObject = Record<RowIndex, Record<ColumnIndex, CellModel>>;

type RowIndex = number;
type ColumnIndex = number;
type ColumnValue = number;
export type SpreadsheetCell = [RowIndex, ColumnIndex, ColumnValue];

export type SpreadsheetDataTable = {
    columns: string[];
    records: Array<{ [key: string]: string; }>;
}

export type PluginNames = "user-insight" | "competitive-analysis";
export type SpreadsheetPluginParams = {
    name: PluginNames;
    data: any;
    rendered: boolean;
    state: {
        status: "waiting" | "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
}