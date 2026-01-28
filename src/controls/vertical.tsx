import React from 'react';
import { IStackProps, Stack } from './stack';

interface IProps extends Omit<IStackProps, "direction" | "justified"> {
    /** horizontal align items center */
    centered?: boolean;
    /** align items vertical centered */
    vCentered?: boolean;
    /** vertical space items evenly */
    vSpaced?: boolean | "evenly" | "between" | "around";
}
export const Vertical = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IProps>>((props, ref) => {
    return <Stack {...props} ref={ref}
        direction='v'
        justified={props.vCentered === true ? "centered" : props.vSpaced === true ? "evenly" : props.vSpaced}
    />;
});