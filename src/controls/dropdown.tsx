import { Dropdown, DropdownProps, makeStyles, mergeClasses, Option } from '@fluentui/react-components';
import { filterEmptyEntries, firstOrNull, GetLogger, isNullOrUndefined } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';

const logger = new GetLogger("DropdownEX");

const useStyles = makeStyles({
    root: {
        minWidth: "auto"
    },
});

type ForwardProps = Omit<DropdownProps, "onSelect" | "selectedOptions" | "clearable">;

interface IProps<keyType, dataType> extends ForwardProps {
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

function $DropdownEX<keyType extends string = string, dataType = never>(props: IProps<keyType, dataType>, ref: React.ForwardedRef<HTMLButtonElement>) {
    const classes = useStyles();
    const ctx = useKWIZFluentContext();
    const selected: keyType[] = Array.isArray(props.selected) ? props.selected : isNullOrUndefined(props.selected) ? [] : [props.selected];

    //sometimes control will lose value when re-rendered
    //use case: public forms when editing other fields after the dropdown was set
    //re-set the text value manually to fix
    let text = filterEmptyEntries((Array.isArray(props.selected) ? props.selected : [props.selected]).map(s => {
        let v = firstOrNull(props.items, i => i.key === s);
        return v ? v.value : ''
    })).join(', ');

    return (
        <Dropdown {...{ ...props, onSelect: undefined }} className={mergeClasses(classes.root, props.className)} ref={ref} clearable={!props.required && !props.multiselect}
            appearance={ctx.inputAppearance} mountNode={ctx.mountNode}
            selectedOptions={selected} value={text} onOptionSelect={(e, data) => {
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

/** @deprecated use normal DropdownEX it is now generic */
export function getDropdownEX<keyType extends string = string, dataType = never>() {
    logger.i.warn('getDropdownEX is deprecated. use DropdownEX it now supports generic types');
    return React.forwardRef($DropdownEX<keyType, dataType>);
}