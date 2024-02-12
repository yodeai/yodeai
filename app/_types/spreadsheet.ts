export type SpreadsheetColumns = Array<string>;
export type SpreadsheetDataSource = Array<Array<string>>;

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