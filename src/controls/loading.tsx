import { LOGO_ANIM_DARK, LOGO_ANIM_LIGHT } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { Centered, iCenteredProps } from './centered';

export interface iLoadingProps extends iCenteredProps {
    dark?: boolean;
}
export const Loading: React.FunctionComponent<iLoadingProps> = (props) => {
    const ctx = useKWIZFluentContext();
    const src = props.dark === true || ctx.dark
        ? LOGO_ANIM_DARK
        : LOGO_ANIM_LIGHT;

    return <Centered {...props}><img src={src} alt="loading" style={{ width: '15vw' }} /></Centered>
}