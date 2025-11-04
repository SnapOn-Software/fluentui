import { Dropdown, DropdownProps, makeStyles, mergeClasses, Option } from '@fluentui/react-components';
import { CommonLogger, filterEmptyEntries, firstOrNull, isNotEmptyArray, isNotEmptyString, isNullOrUndefined, isUndefined } from '@kwiz/common';
import React, { useEffect, useMemo, useState } from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';

const logger = new CommonLogger("DropdownEX");

const useStyles = makeStyles({
    root: {
        minWidth: "auto"
    },
    filter: {
        position: "absolute",
        zIndex: 1,
        top: "-8px", right: 0
    }
});

type ForwardProps = Omit<DropdownProps, "onSelect" | "selectedOptions" | "clearable" | "defaultSelectedOptions">;

interface iProps<keyType, dataType> extends ForwardProps {
    required?: boolean;
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
type tProps<keyType, dataType> = iProps<keyType, dataType> & ({
    selected: keyType | keyType[];
    defaultSelected?: never;

} | {
    selected?: never;
    defaultSelected: keyType | keyType[];
});

function $DropdownEX<keyType extends string = string, dataType = never>(props: tProps<keyType, dataType>, ref: React.ForwardedRef<HTMLButtonElement>) {
    const classes = useStyles();
    const ctx = useKWIZFluentContext();

    const [isUnControlled, setIsUnControlled] = useState(!isUndefined(props.defaultSelected));

    const __isUnControlled = !isUndefined(props.defaultSelected);
    useEffect(() => {
        if (__isUnControlled !== isUnControlled) {
            logger.error(`A DropdownEX control was switched from controlled to uncontrolled mode. This is not supported.`);
            setIsUnControlled(__isUnControlled);
            if (!__isUnControlled) {
                setUncontrolledSelected(props.selected);
            }
        }
    }, [__isUnControlled, isUnControlled]);

    const [uncontrolledSelected, setUncontrolledSelected] = useState(isUnControlled ? props.defaultSelected : props.selected);

    const selectedValueToUse = isUnControlled ? uncontrolledSelected : props.selected;

    const selected: keyType[] = Array.isArray(selectedValueToUse) ? selectedValueToUse : isNullOrUndefined(selectedValueToUse) ? [] : [selectedValueToUse];

    //sometimes control will lose value when re-rendered
    //use case: public forms when editing other fields after the dropdown was set
    //re-set the text value manually to fix
    let text = filterEmptyEntries((Array.isArray(selectedValueToUse) ? selectedValueToUse : [selectedValueToUse]).map(s => {
        let v = firstOrNull(props.items, i => i.key === s);
        return v ? v.value : ''
    })).join(', ');

    const [filter, setFilter] = useState("");
    const items = useMemo(() => {
        const itms = props.items;
        if (isNotEmptyArray(itms)) {
            if (isNotEmptyString(filter))
                return itms.filter(i => i.value.toLowerCase().includes(filter));
        }

        return itms;
    }, [props.items, filter]);

    return (
        <Dropdown {...{ ...props, onSelect: undefined }} className={mergeClasses(classes.root, props.className)} ref={ref} clearable={!props.required && !props.multiselect}
            appearance={ctx.inputAppearance} mountNode={ctx.mountNode}
            //clear filter every time we open the dropdown
            onOpenChange={() => { if (isNotEmptyString(filter)) setFilter(""); }}
            onKeyDown={(e) => {
                if (e.key.match(/^[a-z0-9]$/i)) {
                    e.defaultPrevented = true;
                    setFilter(`${filter}${e.key}`.toLowerCase());
                }
                else if (e.key === "Backspace") {
                    setFilter(filter.slice(0, filter.length - 1));
                }
            }}
            selectedOptions={selected} value={text} onOptionSelect={(e, data) => {
                let o = firstOrNull(props.items, i => i.key === data.optionValue);
                if (props.multiselect) {
                    let current = data.selectedOptions.map(s => firstOrNull(props.items, i => i.key === s));
                    setUncontrolledSelected(current.map(o => o.key));
                    props.onSelect(o, current);
                }
                else {
                    setUncontrolledSelected(o.key);
                    props.onSelect(o);
                }
            }}>
            {items.map(i => <Option key={i.key} value={i.key} text={i.value}>{i.option ? i.option : i.value}</Option>)}
        </Dropdown>
    );
}

export const DropdownEX = React.forwardRef($DropdownEX);

/** @deprecated use normal DropdownEX it is now generic */
export function getDropdownEX<keyType extends string = string, dataType = never>() {
    logger.i.warn('getDropdownEX is deprecated. use DropdownEX it now supports generic types');
    return React.forwardRef($DropdownEX<keyType, dataType>);
}