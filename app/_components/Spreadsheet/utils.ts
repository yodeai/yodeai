import { SpreadsheetDataSource, SpreadsheetDataTable } from 'app/_types/spreadsheet';

export const buildDataTable = (dataSource: SpreadsheetDataSource): SpreadsheetDataTable => {
    const columns = dataSource.filter((cell, index) => cell[0] === 0).map(cell => cell[2]);

    const records = dataSource.reduce((acc, cell) => {
        const [rowIndex, colIndex, value] = cell;
        if (!acc[rowIndex]) {
            acc[rowIndex] = {};
        }
        acc[rowIndex][columns[colIndex]] = value;
        return acc;
    }, []).slice(1);

    return { columns, records };
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