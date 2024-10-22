import { makeStyles } from '@fluentui/react-components';
import { isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { KnownClassNames, mixins } from '../styles/styles';
import { ISectionProps, Section } from './section';

const useStyles = makeStyles({
    vertical: {
        ...mixins.flex,
        flexDirection: 'column'
    },
    wrap: mixins.wrap,
    nogap: mixins.nogap
})

interface IProps extends ISectionProps {
    wrap?: boolean;
    nogap?: boolean;
}
export const Vertical: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const cssNames = useStyles();
    let css: string[] = [KnownClassNames.vertical];

    css.push(cssNames.vertical);
    if (props.wrap)
        css.push(cssNames.wrap);
    if (props.nogap)
        css.push(cssNames.nogap);

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    return (
        <Section {...props} css={css} />
    );
}