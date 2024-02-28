import { SpreadsheetDataSourceObject, SpreadsheetDataSource, SpreadsheetDataTable } from 'app/_types/spreadsheet';

export const convertIndexToColumnAlphabet = (index: number) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    while (index >= 0) {
        result = alphabet[index % 26] + result;
        index = Math.floor(index / 26) - 1;
    }
    return result;
}

export const convertDataSource = {
    arrayToObject: (data: SpreadsheetDataSource): SpreadsheetDataSourceObject => {
        return data.reduce((acc, [rowIndex, colIndex, value]) => {
            if (!acc[rowIndex]) acc[rowIndex] = {};
            acc[rowIndex][colIndex] = { value };
            return acc;
        }, {});
    },
    objectToArray: (data: SpreadsheetDataSourceObject): SpreadsheetDataSource => {
        return Object.entries(data)
            .reduce((acc, [rowIndex, cols]) => {
                return acc
                    .concat(Object.entries(cols)
                        .map(([colIndex, value]) =>
                            [Number(rowIndex), Number(colIndex), value]));
            }, []);
    },
    objectToDataTable: (data: SpreadsheetDataSourceObject): SpreadsheetDataTable => {
        return {
            columns: Object.keys(data)
                .reduce((acc, rowIndex) => {
                    return acc.concat(Object.keys(data[rowIndex]));
                }, [])
                .filter((value, index, self) => self.indexOf(value) === index),
            records: Object.keys(data)
                .map(rowIndex => {
                    return Object.keys(data[rowIndex])
                        .reduce((acc, colIndex) => {
                            acc[colIndex] = data[rowIndex][colIndex];
                            return acc;
                        }, {});
                })
        }
    }
}