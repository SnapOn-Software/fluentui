import { LOGO_ANIM_SMALL } from '@kwiz/common';
import { Centered } from './centered';
import React from 'react';

interface IProps {
}
export const Loading: React.FunctionComponent<IProps> = (props) => {
    return (
        <Centered><img src={LOGO_ANIM_SMALL} alt="loading" style={{ width: '15vw' }} /></Centered>
    );
}