import { Caption1 } from '@fluentui/react-components';
import { isNotEmptyString, LOGO_ANIM_DARK, LOGO_ANIM_LIGHT } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { Centered, iCenteredProps } from './centered';
import { Horizontal } from './horizontal';
import { Vertical } from './vertical';

export interface iLoadingProps extends iCenteredProps {
    dark?: boolean;
    label?: string;
}
export const Loading: React.FunctionComponent<iLoadingProps> = (props) => {
    const ctx = useKWIZFluentContext();
    const src = props.dark === true || ctx.dark
        ? LOGO_ANIM_DARK
        : LOGO_ANIM_LIGHT;

    return <Centered {...props}>
        <Vertical>
            <img src={src} alt="loading" style={{ width: '15vw' }} />
            {isNotEmptyString(props.label) && <Horizontal hCentered><Caption1>{props.label}</Caption1></Horizontal>}
        </Vertical>
    </Centered>
}