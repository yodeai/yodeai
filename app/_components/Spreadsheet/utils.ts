import { SpreadsheetDataSource } from 'app/_types/spreadsheet';

export const buildDataSource = (dataSource: SpreadsheetDataSource) => {
    const columns = dataSource[0];
    return dataSource.slice(1).reduce<Array<{ [key: string]: string }>>((arr, row, rowIndex) => {
        let newRow = row.reduce<{ [key: string]: string }>((acc, cell, cellIndex) => {
            acc[columns[cellIndex]] = cell;
            return acc;
        }, {});
        arr.push(newRow);
        return arr;
    }, []);

}

export const convertIndexToColumnAlphabet = (index: number) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    while (index >= 0) {
        result = alphabet[index % 26] + result;
        index = Math.floor(index / 26) - 1;
    }
    return result;
}