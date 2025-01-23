import { GriffelStyle, Input, InputOnChangeData, InputProps, Label, Link, makeStyles, mergeClasses, Textarea, TextareaProps } from '@fluentui/react-components';
import { isFunction, isNotEmptyArray, isNullOrEmptyString, isNullOrNaN, isNullOrUndefined, isNumber } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { useCommonStyles } from '../styles/styles';
import { Horizontal } from './horizontal';
import { MenuEx } from './menu';
import { Section } from './section';
import { Vertical } from './vertical';


interface IProps extends InputProps {
    onOK?: () => void;
    onCancel?: () => void;
    tokens?: { title: string; value: string; replace?: boolean; }[];
    tokenMenuLabel?: string;
}
export const InputEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const input = <Input appearance={ctx.inputAppearance} {...props}
        onKeyDown={isFunction(props.onOK) || isFunction(props.onCancel)
            ? e => {
                if (isFunction(props.onOK) && e.key === "Enter") props.onOK();
                else if (isFunction(props.onCancel) && e.key === "Escape") props.onCancel();
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
    growNoShrink?: boolean;
}
export const TextAreaEx: React.FunctionComponent<React.PropsWithChildren<IPropsTextArea>> = (props) => {
    const cssNames = useStyles();
    let css: string[] = [];

    if (props.fullSize) css.push(cssNames.fullSizeTextArea);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const recalcHeight = React.useCallback(() => {
        if (textAreaRef.current && props.growNoShrink) {
            if (textAreaRef.current.scrollHeight > textAreaRef.current.clientHeight)
                textAreaRef.current.style.minHeight = textAreaRef.current.scrollHeight + 'px';
        }
    }, [textAreaRef]);

    let style: React.CSSProperties = { height: '100%', ...props.style };
    return (
        <Textarea ref={textAreaRef} className={mergeClasses(...css)} {...props} style={style} onChange={(e, d) => {
            if (props.onChange) props.onChange(e, d);
            recalcHeight();
        }} />
    );
}


interface INumberProps extends Omit<IProps, "value" | "onChange" | "defaultValue" | "inputMode"> {
    defaultValue?: number;
    onChange: (value: number) => void;
    allowDecimals?: boolean;
    /** if sent true - onChange will only be called when a valid non-empty value is being set */
    required?: boolean;
}
export const InputNumberEx: React.FunctionComponent<React.PropsWithChildren<INumberProps>> = (props) => {
    const commonStyles = useCommonStyles();
    const [valueStr, setValueStr] = React.useState(isNumber(props.defaultValue) ? `${props.defaultValue}` : '');
    const [isValid, setIsValid] = React.useState(true);
    const onChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
        const newValue = data.value;
        setValueStr(newValue);//update text box anyways
        const asNumber = props.allowDecimals ? parseFloat(newValue) : parseInt(newValue, 10);
        const isValid = props.required ? !isNullOrNaN(asNumber) : isNullOrUndefined(asNumber) || !isNaN(asNumber);
        setIsValid(isValid);
        props.onChange(isValid ? asNumber : null);
    }, [props.allowDecimals, props.onChange, props.required]);

    const passProps: IProps = { ...props, defaultValue: undefined, value: undefined, onChange: undefined };

    return (
        <Vertical nogap>
            <InputEx inputMode={props.allowDecimals ? "decimal" : "numeric"} {...passProps} value={valueStr} onChange={onChange} />
            {!isValid && <Label className={commonStyles.validationLabel}>this is not a valid value</Label>}
        </Vertical>
    );
}