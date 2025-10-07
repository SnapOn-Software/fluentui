
import { InteractionTag, InteractionTagPrimary, InteractionTagSecondary, Tag, TagAppearance, TagShape, TagSize } from '@fluentui/react-components';
import { isFunction, isNullOrUndefined } from '@kwiz/common';
import * as React from 'react';
import { KnownClassNames } from '../styles';

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
    /** control appearance based on selection mode */
    selected?: true | false | "none"
}
export const TagEx: React.FunctionComponent<React.PropsWithChildren<iProps>> = (props) => {
    let className: string;
    let appearance = props.appearance;
    if (!isNullOrUndefined(props.selected)) {
        appearance = props.selected === true ? "brand" : props.selected === false ? "outline" : "filled";
        className = props.selected === true ? KnownClassNames.tagSelected : props.selected === false ? KnownClassNames.tagUnselected : KnownClassNames.tagNoSelection;
    }
    return isFunction(props.action)
        ? <InteractionTag className={className} title={props.title} shape={props.shape} size={props.size} appearance={appearance} disabled={props.disabled} value={props.value}>
            <InteractionTagPrimary media={props.icon ? undefined : props.media} icon={props.icon} onClick={props.action}
                secondaryText={props.secondaryText} hasSecondaryAction={isFunction(props.secondaryAction)}>{props.text}</InteractionTagPrimary>
            {props.secondaryAction && <InteractionTagSecondary onClick={props.secondaryAction} aria-label="remove" />}
        </InteractionTag>
        : <Tag className={className} title={props.title} shape={props.shape} size={props.size} appearance={appearance} disabled={props.disabled}
            dismissible={isFunction(props.secondaryAction)} value={props.value}>
            {props.text}
        </Tag>;
}