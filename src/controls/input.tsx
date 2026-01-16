import { GriffelStyle, Input, InputOnChangeData, InputProps, Label, Link, makeStyles, mergeClasses, Textarea, TextareaOnChangeData, TextareaProps } from '@fluentui/react-components';
import { isFunction, isNotEmptyArray, isNullOrEmptyString, isNullOrNaN, isNullOrUndefined, isNumber, pasteTextAtCursor, stopEvent } from '@kwiz/common';
import React, { useCallback, useEffect } from 'react';
import { useEffectOnlyOnMount, useRefWithState } from '../helpers';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { useCommonStyles } from '../styles/styles';
import { Horizontal } from './horizontal';
import { MenuEx } from './menu';
import { Section } from './section';
import { Vertical } from './vertical';


interface IProps extends InputProps {
    /** fire on enter */
    onOK?: () => void;
    /** fire on escape */
    onCancel?: () => void;
    tokens?: { title: string; value: string; replace?: boolean; }[];
    tokenMenuLabel?: string;
}
export const InputEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const input = <Input appearance={ctx.inputAppearance} {...props}
        onKeyDown={isFunction(props.onOK) || isFunction(props.onCancel)
            ? e => {
                if (e.key === "Enter") props.onOK?.();
                if (e.key === "Escape") props.onCancel?.();
            }
            : undefined
        }
    />;
    return (
        isNotEmptyArray(props.tokens)
            ? <Vertical nogap>
                {input}
                <Horizontal nogap>
                    <Section main />
                    <MenuEx trigger={<Link>{props.tokenMenuLabel || "tokens"}</Link>} items={props.tokens.map(token =>
                    ({
                        title: token.title, onClick: () => {
                            let newValue = props.value || "";
                            if (token.replace) {
                                newValue = token.value;
                            }
                            else {
                                if (isNullOrEmptyString(props.value))
                                    newValue = token.value;
                                else
                                    newValue += ` ${token.value}`;
                            }
                            props.onChange(null, {
                                value: newValue
                            });
                        }
                    }))} />
                </Horizontal>
            </Vertical>
            : input
    );
}

const fullSize: GriffelStyle = {
    width: '100% !important',
    maxHeight: '100% !important'
};
const useStyles = makeStyles({
    fullSizeTextArea: {
        ...fullSize,
        ['& > textarea']: fullSize
    },
})

interface IPropsTextArea extends TextareaProps {
    fullSize?: boolean;
    /** recalc the height to grow to show all text */
    growNoShrink?: boolean;
    allowTab?: boolean;
    /** fire on enter */
    onOK?: () => void;
    /** fire on escape */
    onCancel?: () => void;
    onValueChange?: (e: React.ChangeEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>, d: {
        value: string;
        elm: HTMLTextAreaElement;
    }) => void;
}
export const TextAreaEx: React.FunctionComponent<React.PropsWithChildren<IPropsTextArea>> = (props) => {
    const cssNames = useStyles();
    let css: string[] = [];

    if (props.fullSize) css.push(cssNames.fullSizeTextArea);
    const textAreaRef = useRefWithState<HTMLTextAreaElement>(null);
    const recalcHeight = React.useCallback(() => {
        if (textAreaRef.ref.current && props.growNoShrink) {
            if (textAreaRef.ref.current.scrollHeight > textAreaRef.ref.current.clientHeight)
                textAreaRef.ref.current.style.minHeight = textAreaRef.ref.current.scrollHeight + 'px';
        }
    }, useEffectOnlyOnMount);

    useEffect(() => { recalcHeight(); }, [textAreaRef.value]);

    const onChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>, d: TextareaOnChangeData) => {
        props.onValueChange?.(e, { value: d.value, elm: textAreaRef.ref.current });
        recalcHeight();
    }, [props.onChange]);

    const needOnKeyDown = props.allowTab || isFunction(props.onOK) || isFunction(props.onCancel);

    let style: React.CSSProperties = { height: '100%', ...props.style };

    return (
        <Textarea ref={textAreaRef.set} className={mergeClasses(...css)} {...props} style={style}
            onKeyDown={needOnKeyDown ? (e) => {
                if (props.allowTab && e.key === "Tab") {
                    stopEvent(e);
                    const textArea = e.target as HTMLTextAreaElement;
                    pasteTextAtCursor(textArea, "\t");
                    onChange(e, { value: textArea.value });
                    return;
                }
                if (e.key === "Enter") props.onOK?.();
                if (e.key === "Escape") props.onCancel?.();
                props.onKeyDown?.(e);
            } : props.onKeyDown}
            onChange={(e, d) => {
                props.onChange?.(e, d);
                onChange(e, d);
            }} />
    );
}


interface INumberProps extends Omit<IProps, "value" | "onChange" | "defaultValue" | "inputMode"> {
    defaultValue?: number;
    onChange: (value?: number) => void;
    allowDecimals?: boolean;
    /** if sent true - onChange will only be called when a valid non-empty value is being set */
    required?: boolean;
}
export const InputNumberEx: React.FunctionComponent<React.PropsWithChildren<INumberProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const commonStyles = useCommonStyles();
    const [valueStr, setValueStr] = React.useState(isNumber(props.defaultValue) ? `${props.defaultValue}` : '');
    const [isValid, setIsValid] = React.useState(true);
    const onChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const newValue = data.value;
        setValueStr(newValue);//update text box anyways
        const asNumber = isNullOrEmptyString(newValue)
            ? null//empty value shoudl be null, not parsed into NaN
            : props.allowDecimals ? parseFloat(newValue) : parseInt(newValue, 10);
        const isValid = props.required
            ? !isNullOrNaN(asNumber)
            : isNullOrUndefined(asNumber) || !isNaN(asNumber);
        setIsValid(isValid);
        props.onChange(isValid ? asNumber : null);
    }, [props.allowDecimals, props.onChange, props.required]);

    const passProps: IProps = { ...props, defaultValue: undefined, value: undefined, onChange: undefined };

    return (
        <Vertical nogap>
            <InputEx dir="ltr" inputMode={props.allowDecimals ? "decimal" : "numeric"} {...passProps} value={valueStr} onChange={onChange} />
            {!isValid && <Label className={commonStyles.validationLabel}>{ctx.strings?.validation_invalid?.({ context: "number" }) || "value must be a valid number"}</Label>}
        </Vertical>
    );
}