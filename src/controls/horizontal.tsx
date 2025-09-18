import React from 'react';
import { IStackProps, Stack } from './stack';

export interface iHorizontalProps extends Omit<IStackProps, "direction" | "justified"> {
    /** vertical align items center */
    centered?: boolean;
    /** align items horizontal centered */
    hCentered?: boolean;
}
export const Horizontal = React.forwardRef<HTMLDivElement, React.PropsWithChildren<iHorizontalProps>>((props, ref) => {
    return <Stack {...props} ref={ref}
        direction='h'
        justified={props.hCentered} />;
});