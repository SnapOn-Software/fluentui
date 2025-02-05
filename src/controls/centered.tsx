import React from 'react';
import { Horizontal } from './horizontal';
import { Vertical } from './vertical';

interface IProps {
}
export const Centered: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    return (
        <Vertical main vCentered>
            <Horizontal hCentered>
                {props.children}
            </Horizontal>
        </Vertical>
    );
}