import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger } from '@fluentui/react-components';
import { isNullOrEmptyString } from '@kwiz/common';
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
    title?: string;
    okButtonProps?: Partial<ButtonEXProps>;
    cancelButtonProps?: Partial<ButtonEXProps>;
    children?: JSX.Element;
}
export const Prompter: React.FunctionComponent<React.PropsWithChildren<IPrompterProps>> = (props) => {
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
    return (
        <Dialog open>
            <DialogSurface mountNode={ctx.mountNode}>
                {!isNullOrEmptyString(props.title) && <DialogTitle>{props.title}</DialogTitle>}
                <DialogBody>
                    <DialogContent>
                        {props.children}
                    </DialogContent>
                    <DialogActions>
                        {props.hideOk ? undefined : <DialogTrigger disableButtonEnhancement>
                            <ButtonEXSecondary {...okProps} />
                        </DialogTrigger>}
                        {props.hideCancel ? undefined : <DialogTrigger disableButtonEnhancement>
                            <ButtonEXSecondary {...cancelProps} />
                        </DialogTrigger>}
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}