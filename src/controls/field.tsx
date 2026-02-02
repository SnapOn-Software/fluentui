import { Field, FieldProps } from "@fluentui/react-components";
import { isNotEmptyString, isNullOrEmptyArray, isNullOrEmptyString, isNullOrUndefined, stringEqualsOrEmpty } from "@kwiz/common";
import { useCallback, useEffect, useState } from "react";
import { useFormValidationContext } from "./form-context";

interface iProps<ValueType> extends FieldProps {
    /** return non empty string if value is not valid */
    validation?: () => string;
    formKey?: string;
    required?: boolean;

    /** sendIn */
    value?: ValueType;
}

export function FormFieldEX<ValueType>(props: iProps<ValueType>) {
    const { validation, formKey, required, value } = props;

    const validate_internal = useCallback(() => {
        //calc if value is valid
        let error = validation
            ? validation()
            : "";
        if (isNullOrEmptyString(error) && required) {
            if ((Array.isArray(value) ? isNullOrEmptyArray(value) : isNullOrEmptyString(value)))
                error = "Missing required value";
        }
        return error;
    }, [validation, required, value]);

    const [error, setError] = useState(validate_internal());

    useEffect(() => {
        const newError = validate_internal();
        if (!stringEqualsOrEmpty(newError, error))
            setError(newError);
    }, [validate_internal, value, error]);

    const formContext = useFormValidationContext();

    useEffect(() => {
        if (!isNullOrUndefined(formContext?.setError)) {
            formContext.setError(error, formKey);
        }
    }, [formContext, error, formKey]);

    return <Field {...props}
        validationMessage={formContext.showErrors ? error : undefined} validationState={formContext.showErrors && isNotEmptyString(error) ? "error" : "none"}>
        {props.children}
    </Field>;
}