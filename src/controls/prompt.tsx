import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger } from '@fluentui/react-components';
import { isNotEmptyArray, isNullOrEmptyString } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context';
import { ButtonEXProps, ButtonEXSecondary } from './button';

export interface IPrompterProps {
    hideOk?: boolean;
    hideCancel?: boolean;
    /** return false to prevent closing the dialog. */
    onOK?: () => Promise<void> | void;
    onCancel?: () => void;
    okButtonText?: string;
    cancelButtonText?: string;
    title?: string | JSX.Element;
    okButtonProps?: Partial<ButtonEXProps>;
    cancelButtonProps?: Partial<ButtonEXProps>;
    children?: JSX.Element;

    /** allow to epand the dialog to be wider */
    maxWidth?: number | string;

    /** additional button actions at the bottom */
    actions?: JSX.Element[];

    /** dialog title action (send multiple ones inside <></>) */
    titleAction?: JSX.Element;

    /** specify a specific mount node for this dialog */
    mountNode?: HTMLElement | null | {
        element?: HTMLElement | null;
        className?: string;
    }
}
export const Prompter = React.forwardRef<HTMLDivElement, (IPrompterProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();

    let okProps: ButtonEXProps = {
        ...(props.okButtonProps as any || {}),
        onClick: () => props.onOK(),
        title: props.okButtonText || 'yes'
    };
    let cancelProps: ButtonEXProps = {
        ...(props.cancelButtonProps as any || {}),
        onClick: () => props.onCancel(),
        title: props.cancelButtonText || 'no'
    };
    React.useEffect(() => {
        let handler = (e: KeyboardEvent) => {
            if (e.key === "Enter") props.onOK();
            else if (e.key === "Escape") props.onCancel();

        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    });

    const actions: JSX.Element[] = [];
    if (!props.hideOk) actions.push(<DialogTrigger key='ok' disableButtonEnhancement>
        <ButtonEXSecondary {...okProps} />
    </DialogTrigger>);
    if (!props.hideCancel) actions.push(<DialogTrigger key='cancel' disableButtonEnhancement>
        <ButtonEXSecondary {...cancelProps} />
    </DialogTrigger>);
    if (isNotEmptyArray(props.actions))
        actions.push(...props.actions);


    return (
        <Dialog open>
            <DialogSurface mountNode={props.mountNode || ctx.mountNode}
                style={!isNullOrEmptyString(props.maxWidth) ? { maxWidth: props.maxWidth } : undefined}>
                {!isNullOrEmptyString(props.title) && <DialogTitle
                    action={props.titleAction}
                >{props.title}</DialogTitle>}
                <DialogBody>
                    <DialogContent ref={ref}>
                        {props.children}
                    </DialogContent>
                    {isNotEmptyArray(actions) && <DialogActions fluid={actions.length > 2}>
                        {actions}
                    </DialogActions>}
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
});