import { makeStyles, mergeClasses, Portal, tokens } from '@fluentui/react-components';
import { getScrollParent, isFunction, isNotEmptyArray, isNotEmptyString, isNullOrUndefined } from '@kwiz/common';
import React, { useEffect, useState } from 'react';
import { useElementSize, useRefWithState } from '../helpers';
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
    sticky: {
        ...mixins.box,
        position: "sticky",
        top: 0,
        overflow: "auto",
        height: "fit-content",
        maxHeight: "fit-content"
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
    /** set height to match scroll parent's height, and stick to top */
    sticky?: boolean;
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
    else if (props.sticky) {
        css.push(cssNames.sticky);
    }

    /** need scrollparent if we are sticky */
    const [scrollParent, setScrollParent] = useState<HTMLElement>(null);
    const divRef = useRefWithState<HTMLDivElement>();

    //wait for my content to finish loading, it might change scrollparent
    const mySize = useElementSize(divRef.ref.current);

    useEffect(() => {
        //setting the forwardRef 
        if (!isNullOrUndefined(ref)) {
            if (isFunction(ref)) ref(divRef.ref.current);
            else (ref as React.MutableRefObject<HTMLDivElement>).current = divRef.ref.current;
        }
    }, [divRef.value]);

    useEffect(() => {
        if (props.sticky) {
            let scrollParent = getScrollParent(divRef.ref.current ? divRef.ref.current.parentElement : null);
            setScrollParent(scrollParent);
        }
    }, [divRef.value, mySize.height]);

    const parentSize = useElementSize(scrollParent);
    useEffect(() => {
        if (props.sticky && divRef.ref.current) {
            let maxHeight = "fit-content";
            if (scrollParent) {
                let height = parseFloat(getComputedStyle(scrollParent).height);
                let myStyle = getComputedStyle(divRef.ref.current);

                let pTop = parseFloat(myStyle.paddingTop);
                let pBottom = parseFloat(myStyle.paddingBottom);
                let mTop = parseFloat(myStyle.marginTop);
                let mBottom = parseFloat(myStyle.marginBottom);
                if (pTop > 0) height -= pTop;
                if (pBottom > 0) height -= pBottom;
                if (mTop > 0) height -= mTop;
                if (mBottom > 0) height -= mBottom;

                maxHeight = `${height}px`;
            }
            divRef.ref.current.style.maxHeight = maxHeight;
        }
    }, [props.sticky, parentSize.height, divRef.value]);

    //a css class might have space and  multiuple classes in it
    if (isNotEmptyArray(props.css)) props.css.filter(c => isNotEmptyString(c)).forEach(c => css.push(...c.split(" ")));
    if (props.fullscreen) css.push(commonStyles.fullscreen);
    const control = <div ref={divRef.set} {...(props.rootProps || {})} title={props.title} style={props.style}
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