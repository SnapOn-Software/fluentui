import { Field, mergeClasses } from '@fluentui/react-components';
import { isNullOrUndefined } from '@kwiz/common';
import React from 'react';
import { GetLogger } from '../_modules/config';
import { InputEx, TextAreaEx } from './input';

const logger = GetLogger('FieldEditor');

interface IProps {
    required?: boolean;
    error?: string;
    value: string;
    onChange: (newValue: string) => void;
    css: string[];
    label: string;
    description?: string;
    type?: "text" | "multiline";
    allowTab?: boolean;
}
export const FieldEditor: React.FunctionComponent<IProps> = (props) => {
    if (isNullOrUndefined(props.value)) {
        logger.error(`${props.label}: value should not be null`);
    }
    return (
        <Field required={props.required}
            validationMessage={props.error || props.description}
            validationState={props.error ? "error" : "none"}>
            {props.type === "multiline"
                ? <TextAreaEx className={props.css && mergeClasses(...props.css)}
                    required={props.required}
                    placeholder={props.label}
                    value={props.value || ""}
                    allowTab={props.allowTab}
                    onValueChange={(e, data) => props.onChange(data.value)}
                />
                : <InputEx className={props.css && mergeClasses(...props.css)}
                    required={props.required}
                    placeholder={props.label}
                    value={props.value || ""}
                    onChange={(e, data) => props.onChange(data.value)} />}
        </Field>
    );
}