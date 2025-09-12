import React from 'react';
import { Horizontal } from './horizontal';
import { Vertical } from './vertical';

interface IProps {
    css?: string[];
}

export const Centered = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IProps>>((props, ref) => {
    return (
        <Vertical main vCentered css={props.css} ref={ref}>
            <Horizontal hCentered>
                {props.children}
            </Horizontal>
        </Vertical>
    );
});