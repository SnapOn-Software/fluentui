import React from 'react';
import { IStackProps, Stack } from './stack';

interface IProps extends Omit<IStackProps, "direction" | "justified"> {
    /** horizontal align items center */
    centered?: boolean;
    /** align items vertical centered */
    vCentered?: boolean;
    /** vertical space items evenly */
    vSpaced?: boolean;
}
export const Vertical = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IProps>>((props, ref) => {
    return <Stack {...props}
        direction='v'
        justified={props.vCentered ? "centered" : props.vSpaced ? "spaced" : false}
    />;
});