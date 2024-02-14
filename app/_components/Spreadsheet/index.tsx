"use client";

import { useRef } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import { SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
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

    const {
        onCreated = () => { },
        onSheetChanged = () => { },
        document,
        isProtected = false
    } = useSpreadsheetPlugin({ $spreadsheet, spreadsheet });

    return (
        <div className='root-spreadsheet control-pane'>
            <div className='control-section spreadsheet-control'>
                <SpreadsheetComponent
                    beforeDataBound={onSheetChanged}
                    isProtected={isProtected}
                    created={onCreated.bind(this)}
                    ref={$spreadsheet}>
                    {document}
                </SpreadsheetComponent>
            </div>
        </div >
    )
}

export default Spreadsheet;