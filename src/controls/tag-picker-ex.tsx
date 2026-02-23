
import { Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption, TagPickerOptionProps, TagPickerProps, TagProps, useTagPickerFilter } from '@fluentui/react-components';
import { EventData, EventHandler } from '@fluentui/react-utilities';
import { CommonLogger, isNotEmptyArray, isNullOrEmptyArray, isNullOrEmptyString, toHash } from '@kwiz/common';
import * as React from 'react';
import { useControlledStateTracker } from '../helpers/use-controlled-state-tracker';

const logger = new CommonLogger("TagPickerEx");

declare type TagPickerOnOptionSelectData<keyType extends string = string> = {
    value: keyType;
    selectedOptions: keyType[];
} & (EventData<'click', React.MouseEvent<HTMLDivElement>> | EventData<'keydown', React.KeyboardEvent<HTMLDivElement>>);

interface iProps<keyType extends string = string> extends Omit<TagPickerProps, "children" | "onOptionSelect"> {
    selectedTagsTitle?: string;
    selectTagsTitle?: string;
    placeholder?: string;
    getSelectedTagProps?: (key: keyType) => Partial<TagProps>;
    getTagProps?: (key: keyType) => Partial<TagPickerOptionProps>;
    selectedOptions?: keyType[];
    defaultSelectedOptions?: keyType[];
    options: { key: keyType; text: string; }[];
    onOptionSelect?: EventHandler<TagPickerOnOptionSelectData<keyType>>;
}
export function TagPickerEx<keyType extends string = string>(props: React.PropsWithChildren<iProps<keyType>>) {
    const { valueToUse, setValue } = useControlledStateTracker({
        name: "TagPickerEx",
        value: props.selectedOptions,
        defaultValue: props.defaultSelectedOptions
    });

    //normalized as array
    const selected: keyType[] = isNotEmptyArray(valueToUse) ? valueToUse : [];

    const optionsHash = React.useMemo(() => {
        return toHash(props.options, o => o.key, undefined, o => o.text);
    }, [props.options]);
    const getOptionText = React.useCallback((option: keyType) => {
        return optionsHash[option];
    }, [optionsHash]);

    const [query, setQuery] = React.useState("");
    const children = useTagPickerFilter({
        query,
        options: Object.keys(optionsHash),
        noOptionsElement: (
            <TagPickerOption value="no-matches">{isNullOrEmptyString(query)
                ? "No more options"
                : "We couldn't find any matches"}
            </TagPickerOption>
        ),
        renderOption: (option: keyType) => (
            <TagPickerOption
                key={option}
                value={option}
                text={getOptionText(option)}
                children={getOptionText(option)}
                {...(props.getTagProps?.(option) || {})}
            />
        ),

        filter: (option: keyType) =>
            !selected.includes(option) &&
            getOptionText(option).toLowerCase().includes(query.toLowerCase()),
    });

    const showPlaceholder = isNullOrEmptyArray(selected);
    const inputTitle = showPlaceholder ? props.placeholder : props.selectTagsTitle;

    return <TagPicker {...props}
        onOptionSelect={(e, data) => {
            setValue(data.selectedOptions as keyType[]);
            props.onOptionSelect?.(e, data as TagPickerOnOptionSelectData<keyType>);
        }}>
        <TagPickerControl>
            <TagPickerGroup
                aria-label={props.selectedTagsTitle || "Selected tags"}
                title={props.selectedTagsTitle || "Selected tags"}
            >
                {selected.map((option) => (
                    <Tag
                        key={option}
                        value={option}
                        as='span'
                        children={getOptionText(option)}
                        {...(props.getSelectedTagProps?.(option) || {})}
                    />
                ))}
            </TagPickerGroup>
            <TagPickerInput
                aria-label={inputTitle || "Select tags"}
                title={inputTitle || "Select tags"}
                placeholder={showPlaceholder ? inputTitle : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </TagPickerControl>
        <TagPickerList>{children}</TagPickerList>
    </TagPicker>;
}