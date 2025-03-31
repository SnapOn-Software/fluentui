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
    nogap: mixins.nogap,
    vCentered: {
        justifyContent: "center"
    },

})

interface IProps extends ISectionProps {
    wrap?: boolean;
    nogap?: boolean;
    /** vertical centered */
    vCentered?: boolean;
}
export const Vertical = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IProps>>((props, ref) => {
    const cssNames = useStyles();
    let css: string[] = [KnownClassNames.vertical];

    css.push(cssNames.vertical);
    if (props.wrap)
        css.push(cssNames.wrap);
    if (props.nogap)
        css.push(cssNames.nogap);
    if (props.vCentered)
        css.push(cssNames.vCentered);

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    return (
        <Section {...props} css={css} ref={ref} />
    );
});