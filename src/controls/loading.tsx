import { LOGO_ANIM_DARK, LOGO_ANIM_LIGHT } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { Centered } from './centered';

interface IProps {
    dark?: boolean;
}
export const Loading: React.FunctionComponent<IProps> = (props) => {
    const ctx = useKWIZFluentContext();
    const src = props.dark === true || ctx.dark
        ? LOGO_ANIM_DARK
        : LOGO_ANIM_LIGHT;

    return (
        <Centered><img src={src} alt="loading" style={{ width: '15vw' }} /></Centered>
    );
}