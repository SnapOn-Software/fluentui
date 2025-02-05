import { makeStyles, mergeClasses, Portal, tokens } from '@fluentui/react-components';
import { isFunction, isNotEmptyArray, isNotEmptyString } from '@kwiz/common';
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
        marginLeft: tokens.spacingHorizontalXXL
    },
    selfCentered: {
        alignSelf: "center"
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
    centerSelf?: boolean;
}

export const Section = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ISectionProps>>((props, ref) => {
    const ctx = useKWIZFluentContext();
    const commonStyles = useCommonStyles();
    const cssNames = useStyles();
    let css: string[] = [KnownClassNames.section];
    if (props.main) css.push(cssNames.main);
    if (props.centerSelf) css.push(cssNames.selfCentered);
    if (isFunction(props.onClick))
        css.push(cssNames.clickable);

    if (props.left) {
        css.push(cssNames.left);
        css.push(KnownClassNames.left);
    }
    else if (props.right) {
        css.push(cssNames.right);
        css.push(KnownClassNames.right);
    }

    //a css class might have space and  multiuple classes in it
    if (isNotEmptyArray(props.css)) props.css.filter(c => isNotEmptyString(c)).forEach(c => css.push(...c.split(" ")));
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