import { Button, ButtonProps, CompoundButton, compoundButtonClassNames, CompoundButtonProps, makeStyles, mergeClasses, tokens, Tooltip } from '@fluentui/react-components';
import { capitalizeFirstLetter, isFunction, isNullOrEmptyString, isNullOrUndefined, isString, PushNoDuplicate } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { commonSizes, KnownClassNames } from '../styles/styles';

interface IProps {
    title: string;//required
    showTitleWithIcon?: boolean;
    dontStretch?: boolean;
    hideOnPrint?: boolean;
    dontCenterText?: boolean;
    hoverIcon?: JSX.Element;
    hoverTitle?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => void | undefined;//type the onClick arg
}
interface IPropsCompound extends IProps {
    width?: string | number;
}

export type ButtonEXProps = IProps & Omit<ButtonProps, "onClick" | "title">;
export type CompoundButtonEXProps = IPropsCompound & Omit<CompoundButtonProps, "onClick" | "title">;;

const useStyles = makeStyles({
    buttonNoCenter: {
        justifyContent: 'flex-start',
        '& *': {
            /* a button with no center that has content of a vertical, or multiple labels */
            alignItems: 'flex-start'
        }
    },
    danger: {
        backgroundColor: tokens.colorStatusDangerBackground1,
        color: tokens.colorStatusWarningForeground2,

        [`& .${compoundButtonClassNames.secondaryContent}`]: {
            color: tokens.colorStatusWarningForeground1
        }
    },
    success: {
        color: tokens.colorStatusSuccessForeground1,

        [`& .${compoundButtonClassNames.secondaryContent}`]: {
            color: tokens.colorStatusSuccessForeground1,
        }
    },
    primarySubtle: {
        color: tokens.colorBrandForeground1,

        [`& .${compoundButtonClassNames.secondaryContent}`]: {
            color: tokens.colorBrandForeground1,
        }
    },
    dangerSubtle: {
        color: tokens.colorStatusWarningForeground2,

        [`& .${compoundButtonClassNames.secondaryContent}`]: {
            color: tokens.colorStatusWarningForeground1
        }
    }
})


export const ButtonEX = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    const [hover, setHover] = React.useState(false);
    const trackHover = !isNullOrEmptyString(props.hoverTitle) || !isNullOrUndefined(props.hoverIcon);

    const title = hover && !isNullOrEmptyString(props.hoverTitle) ? props.hoverTitle
        : props.title || props['aria-label'];
    const icon = hover && !isNullOrUndefined(props.hoverIcon) ? props.hoverIcon : props.icon;
    let hasIcon = !isNullOrUndefined(icon);
    let hasText = props.children || !hasIcon || (hasIcon && props.showTitleWithIcon === true);

    const cssNames = useStyles();
    let css: string[] = [];

    if (props.hideOnPrint) PushNoDuplicate(css, KnownClassNames.printHide);
    if (props.dontCenterText) PushNoDuplicate(css, cssNames.buttonNoCenter);

    let btn = <Button ref={ref} appearance='subtle' {...props as any as ButtonProps} className={mergeClasses(...css, props.className)}
        aria-label={title} title={undefined} icon={icon}
        onMouseEnter={trackHover ? (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setHover(true);
            if (isFunction(props.onMouseEnter))
                props.onMouseEnter(e as any);
        } : props.onMouseEnter as any}
        onMouseLeave={trackHover ? (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setHover(false);
            if (isFunction(props.onMouseLeave))
                props.onMouseLeave(e as any);
        } : props.onMouseLeave as any}
    >{props.children ||
        //no icon? will show the title by default
        (hasText && capitalizeFirstLetter(title))}</Button>;
    if (!hasText || props.children)//icon only or when content is different than props.title
        btn = <Tooltip showDelay={1000} relationship='label' withArrow appearance='inverted' content={title}
            mountNode={ctx.mountNode}
        >
            {btn}
        </Tooltip>;

    return (
        props.dontStretch ? <div>{btn}</div> : btn

    );
});
export const ButtonEXSecondary = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    return (
        <ButtonEX ref={ref} appearance='secondary' shape={ctx.buttonShape} {...props}></ButtonEX>
    );
});
/** to be used in MessageBarActions for prominent actions. Otherwise use ButtonEX or ButtonEXDangerSubtle */
export const ButtonEXMessageBarAction = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    return (
        <ButtonEX ref={ref} appearance='secondary' hideOnPrint {...props}></ButtonEX>
    );
});
export const ButtonEXPrimary = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    return (
        <ButtonEXSecondary ref={ref} appearance='primary' {...props}>{props.children}</ButtonEXSecondary>
    );
});
export const ButtonEXDanger = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEXSecondary ref={ref} className={props.disabled ? undefined : cssNames.danger} {...props}>{props.children}</ButtonEXSecondary>
    );
});
export const ButtonEXSuccess = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} className={cssNames.success} {...props}>{props.children}</ButtonEX>
    );
});
export const ButtonEXPrimarySubtle = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} className={props.disabled ? undefined : cssNames.primarySubtle} {...props}>{props.children}</ButtonEX>
    );
});
export const ButtonEXDangerSubtle = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} className={props.disabled ? undefined : cssNames.dangerSubtle} {...props}>{props.children}</ButtonEX>
    );
});

export const CompoundButtonEX = React.forwardRef<HTMLButtonElement, (CompoundButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    let title = props.title || props['aria-label'];
    let tooltip = isString(props.secondaryContent) ? props.secondaryContent : title;
    let max = typeof (props.width) === "undefined" ? commonSizes.widthMedium : props.width;
    return (
        <Tooltip showDelay={1000} relationship='label' withArrow appearance='inverted' content={tooltip}
            mountNode={ctx.mountNode}
        >
            <CompoundButton ref={ref} appearance='subtle' style={{ justifyContent: "flex-start", maxWidth: max }} {...props as any as CompoundButtonProps} aria-label={tooltip} title={undefined}>
                {props.children || capitalizeFirstLetter(title)}</CompoundButton>
        </Tooltip>
    );
});
export const CompoundButtonEXSecondary = React.forwardRef<HTMLButtonElement, (CompoundButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    return (
        <CompoundButtonEX ref={ref} appearance='secondary' shape={ctx.buttonShape} {...props}></CompoundButtonEX>
    );
});
export const CompoundButtonEXPrimary = React.forwardRef<HTMLButtonElement, (CompoundButtonEXProps)>((props, ref) => {
    return (
        <CompoundButtonEXSecondary ref={ref} appearance='primary' {...props}>{props.children}</CompoundButtonEXSecondary>
    );
});
export const CompoundButtonEXDanger = React.forwardRef<HTMLButtonElement, (CompoundButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <CompoundButtonEXSecondary ref={ref} className={cssNames.danger} {...props}>{props.children}</CompoundButtonEXSecondary>
    );
});