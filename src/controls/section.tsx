import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { isFunction, isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { mixins } from '../styles/styles';

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
}

export const Section = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ISectionProps>>((props, ref) => {
    const cssNames = useStyles();
    let css: string[] = [];
    if (props.main) css.push(cssNames.main);
    if (isFunction(props.onClick))
        css.push(cssNames.clickable);

    if (props.left) css.push(cssNames.left);
    else if (props.right) css.push(cssNames.right);

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    return (
        <div ref={ref} {...(props.rootProps || {})} title={props.title} style={props.style}
            className={mergeClasses(...css)}
            onClick={props.onClick}>
            {props.children}
        </div>
    );
});