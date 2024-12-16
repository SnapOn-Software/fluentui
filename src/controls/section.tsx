import { makeStyles, mergeClasses, Portal, tokens } from '@fluentui/react-components';
import { isFunction, isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { KnownClassNames, mixins, useCommonStyles } from '../styles/styles';

const useStyles = makeStyles({
    main: mixins.main,
    clickable: mixins.clickable,
    left: {
        ...mixins.float,
        float: "left",
        marginRight: tokens.spacingHorizontalXXL
    },
    right: {
        ...mixins.float,
        float: "right",
        marginRight: tokens.spacingHorizontalXXL
    }
});


export interface ISectionProps {
    main?: boolean;
    css?: string[];
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    rootProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    title?: string;
    left?: boolean;
    right?: boolean;
    /** true - will add css position fixed. portal will also wrap it in a portal. */
    fullscreen?: boolean | "portal";
}

export const Section = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ISectionProps>>((props, ref) => {
    const ctx = useKWIZFluentContext();
    const commonStyles = useCommonStyles();
    const cssNames = useStyles();
    let css: string[] = [KnownClassNames.section];
    if (props.main) css.push(cssNames.main);
    if (isFunction(props.onClick))
        css.push(cssNames.clickable);

    if (props.left) css.push(cssNames.left);
    else if (props.right) css.push(cssNames.right);

    if (isNotEmptyArray(props.css)) css.push(...props.css);
    if (props.fullscreen) css.push(commonStyles.fullscreen);
    const control = <div ref={ref} {...(props.rootProps || {})} title={props.title} style={props.style}
        className={mergeClasses(...css)}
        onClick={props.onClick}>
        {props.children}
    </div>;

    return (
        props.fullscreen === "portal"
            ? <Portal mountNode={ctx.mountNode}>
                {control}
            </Portal>
            : control
    );
});