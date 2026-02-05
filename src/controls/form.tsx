import { MessageBar } from "@fluentui/react-components";
import { CommonConfig, isNotEmptyString, isNullOrUndefined, jsonClone } from "@kwiz/common";
import { useCallback, useState } from "react";
import { ButtonEXPrimarySubtle } from "./button";
import { FormFieldEX } from "./field";
import { Internal_FormEX } from "./form-context";
import { PleaseWait } from "./please-wait";
import { Prompter } from "./prompt";
import { Vertical } from "./vertical";

//complex version
/** T would be some sort of FormData {
 *      field:type1
 * }
 * > Make sure K is a key in FormData
 * > Make sure the value type of that field value is type1 T[K]
 * read more: https://stackoverflow.com/questions/68304361/how-to-define-an-array-of-generic-objects-in-typescript-each-item-having-a-diff
} */
// type FormField<FormData> = {
//     [FieldName in Extract<keyof FormData, string>]-?: {
//         required?: boolean;
//         label?: string;
//         hint?: string;
//         key: FieldName;
//         validation?: (value: FormData[FieldName]) => string;
//         fieldControl: (value: FormData[FieldName], setValue: (value: FormData[FieldName]) => void) => JSX.Element;
//     }
// }[Extract<keyof FormData, string>];
//my simpler version

type FormField<FormData> = {
    //creates a type from a key of FormData called FieldName so we can re-use it
    [FieldName in keyof FormData]: {
        required?: boolean;
        label?: string;
        hint?: string;
        key: FieldName;
        validation?: (value: FormData[FieldName], values: FormData) => string;
        /** should not be an uncontrolled control */
        fieldControl: (value: FormData[FieldName], setValue: (value: FormData[FieldName]) => void) => JSX.Element;
    }
}[keyof FormData & string];

export function FormDialogEX<FormData>({ defaultValues, fields, buttonIcon, buttonTitle, dialogTitle, onSubmit, onClose }: {
    defaultValues: FormData;
    fields: FormField<FormData>[];
    buttonIcon?: JSX.Element;
    buttonTitle?: string;
    dialogTitle: string;
    /** called if form fields are all valid */
    onSubmit: (values: FormData) => Promise<string>;
    onClose?: () => void;
}) {
    const addButton = !isNullOrUndefined(buttonIcon) || isNotEmptyString(buttonTitle);

    const [inProgress, setInProgress] = useState(false);
    const [show, setShow] = useState(false);
    const [valid, setValid] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [values, setValues] = useState<FormData>(defaultValues);

    const clearForm = useCallback(() => {
        setValid(false);
        setSubmitError("");
        setValues(jsonClone(defaultValues));
    }, [defaultValues]);

    return <>
        {addButton && <ButtonEXPrimarySubtle icon={buttonIcon} title={buttonTitle}
            onClick={() => { clearForm(); setShow(true); }} />}
        {(show || !addButton) && <Prompter title={dialogTitle} onCancel={() => {
            setShow(false);
            onClose?.();
        }}
            okButtonProps={{ disabled: !valid }}
            onOK={async () => {
                if (valid) {
                    setInProgress(true);
                    let serverError = "";
                    try {
                        serverError = await onSubmit(values);
                    } catch (e) {
                        console.error(e);
                        serverError = "Unknown server error";
                    }
                    if (isNotEmptyString(serverError)) {
                        setSubmitError(serverError);
                    }
                    else {
                        setShow(false);
                    }
                    setInProgress(false);
                }
            }}>
            <Vertical>
                {inProgress && <PleaseWait />}
                <Internal_FormEX submitError={submitError} onValid={isValid => setValid(isValid)}>
                    {fields.map(field => <FormFieldEX key={field.key} label={field.label} hint={field.hint}
                        formKey={field.key} required={field.required} value={values[field.key]}
                        validation={field.validation ? () => {
                            return field.validation(values[field.key], values);
                        } : undefined}
                    >
                        {isNullOrUndefined(values[field.key]) && CommonConfig.i.IsLocalDev && <MessageBar layout="multiline" intent="warning">This should be a controlled element, value should never be null or your control might get out of sync.</MessageBar>}
                        {field.fieldControl(values[field.key], newValue => setValues({ ...values, [field.key]: newValue }))}
                    </FormFieldEX>)}
                </Internal_FormEX>
            </Vertical>
        </Prompter>}
    </>;
}