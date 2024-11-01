import { Dropdown, DropdownProps, Option } from '@fluentui/react-components';
import { filterEmptyEntries, firstOrNull, isNullOrUndefined } from '@kwiz/common';
import React from 'react';

type ForwardProps = Omit<DropdownProps, "onSelect" | "selectedOptions" | "clearable">;

interface IProps<dataType, keyType extends string = string> extends ForwardProps {
    required?: boolean;
    selected: keyType | keyType[];
    items: {
        key: keyType, value: string, data?: dataType,
        /** display complex controls in the drop down */
        option?: JSX.Element;
    }[];
    onSelect: (
        /** the specific option that was selected/unselected */
        option: { key: keyType, value: string, data?: dataType },
        /** only sent for multi select - all selected options, in case of multi select */
        options?: { key: keyType, value: string, data?: dataType }[]) => void;
}

function $DropdownEX<keyType extends string = string, dataType = never>(props: IProps<dataType, keyType>, ref: React.ForwardedRef<HTMLButtonElement>) {
    const selected: keyType[] = Array.isArray(props.selected) ? props.selected : isNullOrUndefined(props.selected) ? [] : [props.selected];

    //sometimes control will lose value when re-rendered
    //use case: public forms when editing other fields after the dropdown was set
    //re-set the text value manually to fix
    let text = Array.isArray(props.selected)
        ? filterEmptyEntries(props.selected.map(s => {
            let v = firstOrNull(props.items, i => i.key === s);
            return v ? v.value : ''
        })).join(', ')
        : props.selected || "";

    return (
        <Dropdown {...{ ...props, onSelect: undefined }} ref={ref} clearable={!props.required && !props.multiselect}
            appearance='underline' selectedOptions={selected} value={text} onOptionSelect={(e, data) => {
                let o = firstOrNull(props.items, i => i.key === data.optionValue);
                if (props.multiselect) {
                    let current = data.selectedOptions.map(s => firstOrNull(props.items, i => i.key === s));
                    props.onSelect(o, current);
                }
                else props.onSelect(o);
            }}>
            {props.items.map(i => <Option key={i.key} value={i.key} text={i.value}>{i.option ? i.option : i.value}</Option>)}
        </Dropdown>

    );
}

export const DropdownEX = React.forwardRef($DropdownEX);