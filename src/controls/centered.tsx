import { isNumber } from '@kwiz/common';
import React from 'react';
import { Horizontal } from './horizontal';
import { ISectionProps } from './section';
import { Vertical } from './vertical';

export interface iCenteredProps {
    css?: string[];
    /** render in a dialog, with backdrop and block content, position: fixed */
    fullscreen?: ISectionProps["fullscreen"];
    /** render in a dialog, with backdrop and block content, position: absolute */
    fullsize?: ISectionProps["fullsize"];
    zIndex?: number;
}

export const Centered = React.forwardRef<HTMLDivElement, React.PropsWithChildren<iCenteredProps>>((props, ref) => {
    return (
        <Vertical main vCentered ref={ref}
            css={props.css}
            fullscreen={props.fullscreen}
            fullsize={props.fullsize}
            style={isNumber(props.zIndex) ? { zIndex: props.zIndex } : undefined}>
            <Horizontal hCentered>
                {props.children}
            </Horizontal>
        </Vertical>
    );
});