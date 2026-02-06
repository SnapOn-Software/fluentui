import { ButtonProps, CompoundButtonProps } from '@fluentui/react-components';
import React, { HTMLAttributeAnchorTarget } from 'react';

export interface iButtonEXProps {
    title: string;//required
    showTitleWithIcon?: boolean;
    dontStretch?: boolean;
    hideOnPrint?: boolean;
    dontCenterText?: boolean;
    hoverIcon?: JSX.Element;
    hoverTitle?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => void | undefined;//type the onClick arg
    /** href will be set to an onclick, with either window.open(href) or window.location.href={href} depending on the target */
    href?: string;
    target?: HTMLAttributeAnchorTarget;
    variant?: "danger" | "success" | "primary-subtle" | "danger-subtle";
}
export interface iButtonEXPropsCompound extends iButtonEXProps {
    width?: string | number;
}

export type ButtonEXProps = iButtonEXProps & Omit<ButtonProps, "onClick" | "title">;
export type CompoundButtonEXProps = iButtonEXPropsCompound & Omit<CompoundButtonProps, "onClick" | "title">;