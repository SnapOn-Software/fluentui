import { Field, ProgressBar } from '@fluentui/react-components';
import { isFunction } from '@kwiz/common';
import React from 'react';
import { IPrompterProps, Prompter } from './prompt';

interface IProps {
    step?: number; max?: number;
    /** do not wrap in a dialog */
    contentOnly?: boolean;
    cancelText?: string;
    onCancel?: () => void;
    label?: string;
}
export const PleaseWait: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const field = <Field validationMessage={props.label || "please wait..."} validationState="none">
        <ProgressBar value={props.step} max={props.max} />
    </Field>;
    return (props.contentOnly
        ? field
        : <Prompter hideOk
            hideCancel={!isFunction(props.onCancel)}
            cancelButtonText={props.cancelText || 'cancel'}
            onCancel={props.onCancel}>{field}</Prompter>
    );
}

export const PleaseWaitPrompt = (props: { message: string; step?: number; max?: number; }): IPrompterProps => ({
    //title: 'please wait...',
    hideOk: true, hideCancel: true,
    children: <Field validationMessage={props.message} validationState="none">
        <ProgressBar value={props.step} max={props.max} />
    </Field>
});