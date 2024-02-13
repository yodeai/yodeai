import React, { useState } from 'react';
import { Tooltip, TooltipProps } from '@mantine/core';

type ConditionalTooltipProps = TooltipProps & {
    children: React.ReactNode;
    visible?: boolean;
    label: string;
}

export default function ConditionalTooltip(props: ConditionalTooltipProps) {
    const { children, visible = false, label } = props;
    const [showTooltip, setShowTooltip] = useState(false);

    if (!visible) return <>{children}</>;
    return <Tooltip
        label={label}
        opened={showTooltip}
        position='left'
        events={{ hover: true, focus: true, touch: false }}>
        <div onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}>
            {children}
        </div>
    </Tooltip>
}