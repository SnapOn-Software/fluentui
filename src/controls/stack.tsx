import { makeStyles } from '@fluentui/react-components';
import { isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { KnownClassNames, mixins } from '../styles/styles';
import { ISectionProps, Section } from './section';

const useStyles = makeStyles({
    horizontal: {
        ...mixins.flex,
        flexDirection: 'row',
        '&.wrap': mixins.wrap
    },
    vertical: {
        ...mixins.flex,
        flexDirection: 'column',
        '&.wrap': mixins.wrap
    },
    nogap: mixins.nogap,
    centered: {
        alignItems: "center"
    },
    justified: {
        justifyContent: "center"
    },
})

export interface IStackProps extends ISectionProps {
    /** h:horizontal, v:vertical */
    direction: "h" | "v";
    wrap?: boolean;
    nogap?: boolean;
    /** align items */
    centered?: boolean;
    /** justify items */
    justified?: boolean;
}
export const Stack = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IStackProps>>((props, ref) => {
    const cssNames = useStyles();
    let css: string[] = [
        props.direction === "h" ? KnownClassNames.horizontal : KnownClassNames.vertical,
        props.direction === "h" ? cssNames.horizontal : cssNames.vertical
    ];

    if (props.wrap)
        css.push(KnownClassNames.wrap);
    if (props.nogap)
        css.push(cssNames.nogap);
    if (props.centered)
        css.push(cssNames.centered);
    if (props.justified)
        css.push(cssNames.justified);

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    return (
        <Section {...props} css={css} ref={ref} />
    );
});