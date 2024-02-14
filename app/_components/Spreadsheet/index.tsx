"use client";

import { useState, useMemo, useRef } from 'react';

import { registerLicense } from '@syncfusion/ej2-base';
import {
    SpreadsheetComponent, SheetsDirective, SheetDirective, ColumnsDirective,
    ColumnDirective, RangesDirective, RangeDirective
} from '@syncfusion/ej2-react-spreadsheet';
import './styles/styles.css';
import './styles/bootstrap.css';
import './styles/material3.css';

registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE);

import { Tables } from 'app/_types/supabase';
import { SpreadsheetDataSource, SpreadsheetPluginParams } from 'app/_types/spreadsheet';
import usePlugin from './Plugins';

type SpreadsheetProps = {
    spreadsheet: Tables<"spreadsheet"> & {
        dataSource: SpreadsheetDataSource;
        plugin: SpreadsheetPluginParams
    }
}

const Spreadsheet = ({ spreadsheet }: SpreadsheetProps) => {
    const useSpreadsheetPlugin = usePlugin(spreadsheet?.plugin?.name);
    const $spreadsheet = useRef<SpreadsheetComponent>();
    const { onCreated, dataTable } = useSpreadsheetPlugin({ $spreadsheet, spreadsheet });

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent
                    isProtected={true}
                    created={onCreated.bind(this)}
                    ref={$spreadsheet}>
                    <SheetsDirective>
                        <SheetDirective name='GDP'>
                            <RangesDirective>
                                <RangeDirective dataSource={dataTable.records} startCell='A1'></RangeDirective>
                            </RangesDirective>
                            {spreadsheet.plugin?.state?.status === "success" &&
                                <ColumnsDirective>
                                    {Array.from({ length: dataTable.columns.length }, (_, i) => <ColumnDirective width={i === 0 ? 250 : 100} key={i} />)}
                                </ColumnsDirective>}
                        </SheetDirective>
                    </SheetsDirective>
                </SpreadsheetComponent>
            </div>
        </div >
    )
}

export default Spreadsheet;