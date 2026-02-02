import { MessageBar } from "@fluentui/react-components";
import { IDictionary, isNotEmptyString, isNullOrEmptyString, jsonClone, stringEqualsOrEmpty } from "@kwiz/common";
import React, { ReactNode, useCallback, useEffect, useState } from "react";


/** do not add to index - this is to be used in FormDialogEX
 * we should create anotehr wrapper for forms that do not need a dialog (toolbar? save/cancel action?)
 */

interface iFormValidationContext {
    errors?: IDictionary<string>;
    setError?: (error: string, key?: string) => void;
    showErrors?: boolean;
}

//create context
export const FormValidationContext = React.createContext<iFormValidationContext>({});
/** fields inside a FormEX component can react to validation errors */
export function useFormValidationContext(): iFormValidationContext {
    const ctx = React.useContext(FormValidationContext);
    return ctx;
}

/** Creates a form validation context, reports back if form is valid so you can enable/disable the save button */
export function Internal_FormEX({ children, onValid, submitError }: {
    children: ReactNode;
    onValid?: (isValid: boolean) => void;
    submitError?: string;
}) {
    const [showErrors, setShowErrors] = useState(false);
    const [errors, setErrors] = useState<IDictionary<string>>({});

    useEffect(() => {
        let valid = true;
        Object.values(errors).forEach(value => {
            if (isNotEmptyString(value))
                valid = false;
        });
        onValid?.(valid);
    }, [errors, onValid]);

    const setError = useCallback((error: string, key?: string) => {
        //clear form errors on any other field change...
        let clearFormError = isNotEmptyString(key);
        key = isNullOrEmptyString(key) ? "form" : key;
        //current error
        const currentError = errors[key];
        if (!stringEqualsOrEmpty(currentError, error)) {
            clearFormError = clearFormError && isNullOrEmptyString(error);
            const newErrors = jsonClone(errors);
            if (clearFormError)
                delete newErrors.form;
            newErrors[key] = error;
            //report back to a form errors collection
            setErrors(newErrors);
        }
    }, [errors]);

    useEffect(() => {
        if (!showErrors && isNotEmptyString(submitError)) setShowErrors(true);
    }, [submitError, showErrors]);

    return <FormValidationContext.Provider
        value={{
            errors,
            setError,
            showErrors
        }}>
        {isNotEmptyString(submitError) && <MessageBar intent="error">{submitError}</MessageBar>}
        {isNotEmptyString(errors.form) && <MessageBar intent="error">{errors.form}</MessageBar>}
        {children}
    </FormValidationContext.Provider>;
}