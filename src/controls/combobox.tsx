import { Combobox, ComboboxProps, Option } from "@fluentui/react-components";
import { firstOrNull, isNotEmptyString } from "@kwiz/common";
import { useMemo } from "react";

interface iProps extends Omit<ComboboxProps, "selectedOptions" | "onChange" | "onOptionSelect" | "children"> {
    items: { key: string; text: string; }[];
    value: string;
    onChange: (value: string) => void;
    freeFormPrefix?: string;
}

const freeFormKey = "$freeform";

//** a controlled single select combo box that allows custom text typing */
export function ComboboxEX(props: iProps) {
    const { items, value, onChange, freeFormPrefix } = props;

    const selectedOption = useMemo(() => firstOrNull(items, i => i.key === value), [items, value]);

    const text = selectedOption?.text || value;

    return <Combobox {...props}
        value={text}
        selectedOptions={isNotEmptyString(value) ? [selectedOption ? selectedOption.key : freeFormKey] : []}
        onChange={(e) => {
            console.log(e.currentTarget.value);
            onChange(e.currentTarget.value);
        }}
        onOptionSelect={(e, data) => {
            if (isNotEmptyString(data.optionValue)) {
                console.log(data.optionValue);
                onChange(data.optionValue);
            }
        }}>
        {!selectedOption && <Option key={freeFormKey}>{`${freeFormPrefix}${value}`}</Option>}
        {items.map(o => <Option key={o.key} value={o.key}>{o.text}</Option>)}
    </Combobox>;
}