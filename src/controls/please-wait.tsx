import { Field, ProgressBar } from '@fluentui/react-components';
import { isFunction } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { IPrompterProps, Prompter } from './prompt';

export interface iPleaseWaitProps {
    step?: number; max?: number;
    /** do not wrap in a dialog */
    contentOnly?: boolean;
    cancelText?: string;
    onCancel?: () => void;
    label?: string;
}
export const PleaseWait: React.FunctionComponent<iPleaseWaitProps> = (props) => {
    const ctx = useKWIZFluentContext();
    //add a hidden input to capture focus, otherwise dialog will show a warning
    const field = <Field validationMessage={props.label || ctx.strings?.prompt_wait?.({ cap: true }) || "please wait..."} validationState="none">
        <ProgressBar value={props.step} max={props.max} />
        <input type="button" style={{ position: "fixed", left: `-200vw` }} />
    </Field>;
    return (props.contentOnly
        ? field
        : <Prompter hideOk
            hideCancel={!isFunction(props.onCancel)}
            cancelButtonText={props.cancelText || 'cancel'}
            onCancel={props.onCancel}>{field}
        </Prompter>
    );
}

export const PleaseWaitPrompt = (props?: { message: string; step?: number; max?: number; }): IPrompterProps => ({
    hideOk: true, hideCancel: true,
    children: <Field validationMessage={props?.message || "please wait..."} validationState="none">
        <ProgressBar value={props?.step} max={props?.max} />
    </Field>
});