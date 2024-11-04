import { GriffelStyle, Input, InputProps, makeStyles, mergeClasses, Textarea, TextareaProps } from '@fluentui/react-components';
import { isFunction } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContextContext } from '../helpers/context';


interface IProps extends InputProps {
    onOK?: () => void;
    onCancel?: () => void;
}
export const InputEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContextContext();
    return (
        <Input appearance={ctx.inputAppearance} {...props}
            onKeyDown={isFunction(props.onOK) || isFunction(props.onCancel)
                ? e => {
                    if (isFunction(props.onOK) && e.key === "Enter") props.onOK();
                    else if (isFunction(props.onCancel) && e.key === "Escape") props.onCancel();
                }
                : undefined
            }
        />
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