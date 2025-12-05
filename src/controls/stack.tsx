import { makeStyles } from '@fluentui/react-components';
import { isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { KnownClassNames, mixins } from '../styles/styles';
import { ISectionProps, Section } from './section';

const useStyles = makeStyles({
    horizontal: {
        ...mixins.flex,
        flexDirection: 'row'
    },
    vertical: {
        ...mixins.flex,
        flexDirection: 'column'
    },
    wrap: mixins.wrap,
    nogap: mixins.nogap,
    centered: {
        alignItems: "center"
    },
    justified: {
        justifyContent: "center"
    },
    justifiedEvenly: {
        justifyContent: "space-evently"
    },
    justifiedBetween: {
        justifyContent: "space-between"
    },
    justifiedAround: {
        justifyContent: "space-around"
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
    justified?: boolean | "centered" | "evenly" | "between" | "around";
}
export const Stack = React.forwardRef<HTMLDivElement, React.PropsWithChildren<IStackProps>>((props, ref) => {
    const cssNames = useStyles();
    let css: string[] = [
        props.direction === "h" ? KnownClassNames.horizontal : KnownClassNames.vertical,
        props.direction === "h" ? cssNames.horizontal : cssNames.vertical
    ];

    if (props.wrap)
        css.push(cssNames.wrap);
    if (props.nogap)
        css.push(cssNames.nogap);
    if (props.centered)
        css.push(cssNames.centered);

    switch (props.justified) {
        case "evenly":
            css.push(cssNames.justifiedEvenly);
            break;
        case "between":
            css.push(cssNames.justifiedBetween);
            break;
        case "around":
            css.push(cssNames.justifiedAround);
            break;
        case "centered":
        case true:
            css.push(cssNames.justified);
            break;
    }

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    return (
        <Section {...props} css={css} ref={ref} />
    );
});