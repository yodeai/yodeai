import { SpreadsheetColumns, SpreadsheetDataSource } from 'app/_types/spreadsheet';

export const buildDataSource = (columns: SpreadsheetColumns, dataSource: SpreadsheetDataSource) => {
    return dataSource.reduce<Array<{ [key: string]: string }>>((arr, row, rowIndex) => {
        let newRow = row.reduce<{ [key: string]: string }>((acc, cell, cellIndex) => {
            acc[columns[cellIndex]] = cell;
            return acc;
        }, {});
        arr.push(newRow);
        return arr;
    }, []);
}