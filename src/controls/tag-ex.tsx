
import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary, Tag, TagAppearance, TagShape, TagSize } from '@fluentui/react-components';
import { isFunction } from '@kwiz/common';
import * as React from 'react';

interface iProps {
    shape?: TagShape;
    size?: TagSize;
    appearance?: TagAppearance;
    disabled?: boolean;
    /** primary text */
    text: string | JSX.Element;
    icon?: JSX.Element;
    media?: JSX.Element;
    secondaryText?: string;
    action?: React.MouseEventHandler<HTMLButtonElement>;
    /** this is only called if a main action also provided. otherwise, it will render a non-clickable tag and dismiss will be handled by a tag group */
    secondaryAction?: React.MouseEventHandler<HTMLButtonElement>;
    value?: string;
    title?: string;
}
export const TagEx: React.FunctionComponent<React.PropsWithChildren<iProps>> = (props) => {
    return isFunction(props.action)
        ? <InteractionTag title={props.title} shape={props.shape} size={props.size} appearance={props.appearance} disabled={props.disabled} value={props.value}>
            <InteractionTagPrimary media={props.icon ? undefined : props.media} icon={props.icon} onClick={props.action}
                secondaryText={props.secondaryText} hasSecondaryAction={isFunction(props.secondaryAction)}>{props.text}</InteractionTagPrimary>
            {props.secondaryAction && <InteractionTagSecondary onClick={props.secondaryAction} aria-label="remove" />}
        </InteractionTag>
        : <Tag title={props.title} shape={props.shape} size={props.size} appearance={props.appearance} disabled={props.disabled}
            dismissible={isFunction(props.secondaryAction)} value={props.value}>
            {props.text}
        </Tag>;
}