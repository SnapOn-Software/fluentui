import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import { Horizontal } from './horizontal';
import { Vertical } from './vertical';

const useStyles = makeStyles({
    center: {
        justifyContent: 'center'
    },
})

interface IProps {
}
export const Centered: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const cssNames = useStyles();
    return (
        <Vertical main css={[cssNames.center]}>
            <Horizontal css={[cssNames.center]}>
                {props.children}
            </Horizontal>
        </Vertical>
    );
}