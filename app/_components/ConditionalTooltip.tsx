import React, { useState } from 'react';
import { Tooltip, TooltipProps } from '@mantine/core';

type ConditionalTooltipProps = TooltipProps & {
    children: React.ReactNode;
    visible?: boolean;
    label: string;
}

export default function ConditionalTooltip(props: ConditionalTooltipProps) {
    const {
        children,
        visible = false,
        label,
        ...rest
    } = props;
    const [showTooltip, setShowTooltip] = useState(false);

    if (!visible) return <>{children}</>;
    return <Tooltip
        label={label}
        opened={showTooltip}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        events={{ hover: true, focus: true, touch: false }}>
        {children}
    </Tooltip>
}