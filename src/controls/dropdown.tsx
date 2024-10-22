import { Dropdown, Option } from '@fluentui/react-components';
import { filterEmptyEntries, firstOrNull } from '@kwiz/common';
import React from 'react';

interface IProps<dataType, keyType extends string = string> {
    selected: keyType[];
    items: { key: keyType, value: string, data?: dataType, option?: JSX.Element; }[];
    onSelect: (item: { key: keyType, value: string, data?: dataType }) => void;
    placeholder?: string;
}

function $DropdownEX<keyType extends string = string, dataType = never>(props: IProps<dataType, keyType>, ref: React.ForwardedRef<HTMLButtonElement>) {
    let text = filterEmptyEntries(props.selected.map(s => {
        let v = firstOrNull(props.items, i => i.key === s);
        return v ? v.value : ''
    })).join(', ');
    return (
        <Dropdown placeholder={props.placeholder} ref={ref} appearance='underline' selectedOptions={props.selected} value={text} >
            {props.items.map(i => <Option key={i.key} value={i.key}
                onClick={() => { props.onSelect(i); }}
                text={i.value}
            >{i.option ? i.option : i.value}</Option>)}
        </Dropdown>

    );
}

export const DropdownEX = React.forwardRef($DropdownEX);