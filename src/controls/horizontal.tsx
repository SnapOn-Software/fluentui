import React from 'react';
import { IStackProps, Stack } from './stack';

interface IProps extends Omit<IStackProps, "direction" | "justified"> {
    /** vertical align items center */
    centered?: boolean;
    /** align items horizontal centered */
    hCentered?: boolean;
}
export const Horizontal = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IProps>>((props, ref) => {
    return <Stack {...props}
        direction='h'
        justified={props.hCentered} />;
});