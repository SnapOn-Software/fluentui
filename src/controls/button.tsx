import { Button, ButtonProps, CompoundButton, compoundButtonClassNames, CompoundButtonProps, makeStyles, mergeClasses, tokens, Tooltip } from '@fluentui/react-components';
import { capitalizeFirstLetter, isFunction, isNotEmptyString, isNullOrEmptyString, isNullOrUndefined, isString, PushNoDuplicate } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { commonSizes, KnownClassNames } from '../styles/styles';
import { ButtonEXProps, CompoundButtonEXProps } from '../types';

const useStyles = makeStyles({
    buttonNoCenter: {
        justifyContent: 'flex-start',
        textAlign: 'start',
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
});

export const ButtonEX = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>(({ showTitleWithIcon,
    dontStretch,
    hideOnPrint,
    dontCenterText,
    icon,
    hoverIcon,
    hoverTitle,
    title,
    'aria-label': ariaLabel,
    children,
    variant,
    className,
    onClick,
    onMouseEnter, onMouseLeave,
    href, target,
    ...passProps }, ref) => {
    const ctx = useKWIZFluentContext();
    const [hover, setHover] = React.useState(false);
    const trackHover = !isNullOrEmptyString(hoverTitle) || !isNullOrUndefined(hoverIcon);

    const myTitle = hover && !isNullOrEmptyString(hoverTitle) ? hoverTitle
        : title || ariaLabel;
    const myIcon = hover && !isNullOrUndefined(hoverIcon) ? hoverIcon : icon;
    let hasIcon = !isNullOrUndefined(myIcon);
    let hasText = children || !hasIcon || (hasIcon && showTitleWithIcon === true);

    const cssNames = useStyles();
    let css: string[] = [];
    if (isNotEmptyString(variant)) {
        switch (variant) {
            case "danger":
                if (!passProps.disabled) css.push(cssNames.danger);
                break;
            case "danger-subtle":
                if (!passProps.disabled) css.push(cssNames.dangerSubtle);
                break;
            case "primary-subtle":
                if (!passProps.disabled) css.push(cssNames.primarySubtle);
                break;
            case "success":
                css.push(cssNames.success);
                break;
        }
    }

    if (hideOnPrint) PushNoDuplicate(css, KnownClassNames.printHide);
    if (dontCenterText) PushNoDuplicate(css, cssNames.buttonNoCenter);

    if (isNullOrUndefined(onClick) && isNotEmptyString(href)) {
        onClick = () => {
            switch (target) {
                case "_top":
                    window.top.location.href = href;
                    break;
                case "_parent":
                    window.parent.location.href = href;
                    break;
                case "_blank":
                    window.open(href);
                    break;
                default:
                    window.location.href = href;
                    break;
            }
        };
    }

    let btn = <Button ref={ref} appearance='subtle' {...passProps as any as ButtonProps} onClick={onClick} className={mergeClasses(...css, className)}
        aria-label={myTitle} title={undefined} icon={myIcon}
        onMouseEnter={trackHover ? (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setHover(true);
            if (isFunction(onMouseEnter))
                onMouseEnter(e as any);
        } : onMouseEnter as any}
        onMouseLeave={trackHover ? (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            setHover(false);
            if (isFunction(onMouseLeave))
                onMouseLeave(e as any);
        } : onMouseLeave as any}
    >{children ||
        //no icon? will show the title by default
        (hasText && capitalizeFirstLetter(myTitle))}</Button>;
    if (!hasText || children)//icon only or when content is different than props.title
        btn = <Tooltip showDelay={1000} relationship='label' withArrow appearance='inverted' content={myTitle}
            mountNode={ctx.mountNode}>
            {btn}
        </Tooltip>;

    return (
        dontStretch ? <div>{btn}</div> : btn

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
        <ButtonEXSecondary ref={ref} variant='danger' {...props}>{props.children}</ButtonEXSecondary>
    );
});
export const ButtonEXSuccess = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} variant="success" {...props}>{props.children}</ButtonEX>
    );
});
export const ButtonEXPrimarySubtle = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} variant="primary-subtle" {...props}>{props.children}</ButtonEX>
    );
});
export const ButtonEXDangerSubtle = React.forwardRef<HTMLButtonElement, (ButtonEXProps)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <ButtonEX ref={ref} variant="danger-subtle" {...props}>{props.children}</ButtonEX>
    );
});

export const CompoundButtonEX = React.forwardRef<HTMLButtonElement, (CompoundButtonEXProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    let title = props.title || props['aria-label'];
    let tooltip = isString(props.secondaryContent) ? props.secondaryContent : title;
    let max = typeof (props.width) === "undefined" ? commonSizes.widthMedium : props.width;

    let onClick = props.onClick;

    if (isNullOrUndefined(onClick) && isNotEmptyString(props.href)) {
        onClick = () => {
            switch (props.target) {
                case "_top":
                    window.top.location.href = props.href;
                    break;
                case "_parent":
                    window.parent.location.href = props.href;
                    break;
                case "_blank":
                    window.open(props.href);
                    break;
                default:
                    window.location.href = props.href;
                    break;
            }
        };
    }

    return (
        <Tooltip showDelay={1000} relationship='label' withArrow appearance='inverted' content={tooltip}
            mountNode={ctx.mountNode}
        >
            <CompoundButton ref={ref} appearance='subtle' style={{ justifyContent: "flex-start", maxWidth: max }} {...props as any as CompoundButtonProps} onClick={onClick} aria-label={tooltip} title={undefined}>
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