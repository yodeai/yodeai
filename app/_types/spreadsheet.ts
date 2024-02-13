export type SpreadsheetDataSource = Array<SpreadsheetCell>;

type RowIndex = number;
type ColumnIndex = number;
type ColumnValue = string;
export type SpreadsheetCell = [RowIndex, ColumnIndex, ColumnValue];

export type PluginNames = "user-insight" | "competitive-analysis";
export type SpreadsheetPluginParams = {
    name: PluginNames;
    data: any;
    state: {
        status: "waiting" | "queued" | "processing" | "success" | "error";
        message?: string;
        progress?: number;
    }
}