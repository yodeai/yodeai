import { useMemo } from "react";
import { ChartModel, CellModel } from "@syncfusion/ej2-react-spreadsheet";
import { SpreadsheetDataSourceObject } from "app/_types/spreadsheet";
import {
    RowDirective, RowsDirective, CellDirective, CellsDirective
} from '@syncfusion/ej2-react-spreadsheet';
import { convertIndexToColumnAlphabet } from "../utils";

type useSheetDataProps = {
    dataSource: SpreadsheetDataSourceObject;
    chart?: JSX.Element;
}
export const useSheetData = ({
    dataSource, chart
}: useSheetDataProps) => {
    if (!dataSource || Object.keys(dataSource).length === 0) return;

    return <RowsDirective>
        {Object.entries(dataSource).map(([rowIndex, cols]) => {
            return <RowDirective key={`r${rowIndex}`} index={Number(rowIndex)}>
                <CellsDirective>
                    {Object.entries(cols).map(([colIndex, value]) => {
                        value = ["string", "number"].includes(typeof value) ? { value } as CellModel : value;
                        return <CellDirective key={`c${colIndex}`} index={Number(colIndex)} {...value}></CellDirective>
                    })}
                </CellsDirective>
            </RowDirective>
        })}
        {chart}
    </RowsDirective>
}

type useSheetCharttProps = {
    dataSource: SpreadsheetDataSourceObject;
}
export const useSheetChart = ({ dataSource }: useSheetCharttProps) => {
    const range = useSheetRange(dataSource);

    if (!dataSource || Object.keys(dataSource).length === 0) return;
    const chart: ChartModel[] = useMemo<ChartModel[]>(() => {
        return [{
            type: "Line", theme: "Fabric", name: "Chart",
            range: `A1:${convertIndexToColumnAlphabet(range.colIndex - 1)}${range.rowIndex}`,
            width: range.colIndex * 101,
            top: (range.rowIndex * 20) + 20,
            left: 230,
            isSeriesInRows: true,
            markerSettings: {
                shape: "Circle",
                size: 5,
                visible: true,
                border: {
                    width: 4
                }
            }
        }]
    }, [dataSource]);

    return <RowDirective index={range.rowIndex}>
        <CellsDirective>
            <CellDirective index={range.colIndex} chart={chart}></CellDirective>
        </CellsDirective>
    </RowDirective>
}

export const useSheetRange = (dataSource: SpreadsheetDataSourceObject) => {
    return useMemo(() => {
        const rowIndex = Object.keys(dataSource).length;
        const colIndex = Object.values(dataSource).reduce((acc, cols) => {
            return Math.max(acc, Object.keys(cols).length);
        }, 0);
        return { rowIndex, colIndex };
    }, [dataSource]);
}