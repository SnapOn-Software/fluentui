import { Dropdown, DropdownProps, makeStyles, mergeClasses, Option } from '@fluentui/react-components';
import { CommonLogger, filterEmptyEntries, firstOrNull, isNotEmptyArray, isNotEmptyString, isNullOrUndefined } from '@kwiz/common';
import React, { useMemo, useState } from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { useControlledStateTracker } from '../helpers/use-controlled-state-tracker';

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

function cleanupValue(value: string) {
    //netsuite sometimes puts &nbsp; in option values for padding
    return value.replace(/&nbsp;/g, ' ');
}
function $DropdownEX<keyType extends string = string, dataType = never>(props: tProps<keyType, dataType>, ref: React.ForwardedRef<HTMLButtonElement>) {
    const classes = useStyles();
    const ctx = useKWIZFluentContext();

    const { valueToUse, setValue } = useControlledStateTracker({
        name: "DropdownEX",
        value: props.selected,
        defaultValue: props.defaultSelected
    });

    //normalized as array
    const selected: keyType[] = Array.isArray(valueToUse) ? valueToUse : isNullOrUndefined(valueToUse) ? [] : [valueToUse];

    //sometimes control will lose value when re-rendered
    //use case: public forms when editing other fields after the dropdown was set
    //re-set the text value manually to fix
    let text = useMemo(() => {
        return filterEmptyEntries(selected.map(s => {
            let v = firstOrNull(props.items, i => i.key === s);
            return v ? cleanupValue(v.value) : ''
        })).join(', ')
    }, [selected, props.items]);

    const [filter, setFilter] = useState("");
    const items = useMemo(() => {
        const itms = props.items;
        if (isNotEmptyArray(itms)) {
            if (isNotEmptyString(filter))
                return itms.filter(i => i.value.toLowerCase().includes(filter));
        }

        return itms;
    }, [props.items, filter]);

    const itemOptions = useMemo(() => {
        return items.map(i => {
            let valueAsText = cleanupValue(i.value);
            let padding = 0;
            //replace any space or &nbsp; at start of valueAsText with padding.
            while (valueAsText.startsWith(' ')) {
                padding++;
                valueAsText = valueAsText.slice(1);
            }
            return <Option key={i.key} value={i.key} text={valueAsText}>{i.option
                ? i.option
                : <>{padding > 0 ? <span style={{ minWidth: `${4 * padding}px` }} /> : undefined}{valueAsText}</>}
            </Option>;
        });

    }, [items]);

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
                    setValue(current.map(o => o.key));
                    props.onSelect(o, current);
                }
                else {
                    setValue(o?.key);
                    props.onSelect(o);
                }
            }}>
            {itemOptions}
        </Dropdown>
    );
}

export const DropdownEX = React.forwardRef($DropdownEX);

/** @deprecated use normal DropdownEX it is now generic */
export function getDropdownEX<keyType extends string = string, dataType = never>() {
    logger.i.warn('getDropdownEX is deprecated. use DropdownEX it now supports generic types');
    return React.forwardRef($DropdownEX<keyType, dataType>);
}