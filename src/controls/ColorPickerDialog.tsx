import { Field } from "@fluentui/react-components";
import { ColorRegular } from "@fluentui/react-icons";
import { isFunction, isNullOrEmptyString, isNumber } from "@kwiz/common";
import * as React from "react";
import ColorPicker, { Color } from 'react-pick-color';
import { useEffectOnlyOnMount, useStateEX } from "../helpers/hooks";
import { ButtonEX } from "./button";
import { InputEx } from "./input";
import { Prompter } from "./prompt";
export interface iProps {
    label?: string;
    value: string;
    onChange: (newValue: string) => void;
    required?: boolean;
    showValidationErrors?: boolean;
    underlined?: boolean;
    width?: number;
    buttonOnly?: boolean;
    placeholder?: string;
    disabled?: boolean;

    /** specify a specific mount node for this dialog */
    mountNode?: HTMLElement | null | {
        element?: HTMLElement | null;
        className?: string;
    }
}

export const ColorPickerEx: React.FunctionComponent<iProps> = (props) => {
    const [isOpen, setIsOpen] = useStateEX<boolean>(false);
    const [selectedColor, setSelectedColor] = useStateEX<string>(props.value);

    const getColorCells = React.useCallback(() => {
        let cells: Color[] = [
            "white", "black"
        ];
        return cells;
    }, useEffectOnlyOnMount);
    return <>
        {props.buttonOnly
            ? <ButtonEX disabled={props.disabled}
                title="Open color picker"
                icon={<ColorRegular
                    color={selectedColor} />
                }
                onClick={(e) => setIsOpen(true)} />
            : <Field label={props.label}
                required={props.required === true}
                validationMessage={props.showValidationErrors && props.required === true && isNullOrEmptyString(selectedColor) ? "You can't leave this blank." : undefined}
            >
                <InputEx disabled={props.disabled}
                    placeholder={props.placeholder || "Enter value here"}
                    style={isNumber(props.width) ? { width: props.width } : undefined}
                    value={selectedColor}
                    onChange={(e, data) => {
                        setSelectedColor(data.value);
                        if (isFunction(props.onChange)) {
                            props.onChange(data.value);
                        }
                    }}
                    contentAfter={<ButtonEX disabled={props.disabled}
                        title="Open color picker"
                        icon={<ColorRegular
                            color={selectedColor} />
                        }
                        onClick={(e) => setIsOpen(true)} />
                    }
                />
            </Field>}
        {isOpen && <Prompter maxWidth={332} mountNode={props.mountNode}
            hideOk hideCancel onCancel={() => {
                if (isFunction(props.onChange)) {
                    props.onChange(selectedColor);
                }
                setIsOpen(false);
            }} showCancelInTitle
            title={props.label || "Choose a color"}
        >
            <ColorPicker color={selectedColor} onChange={color => setSelectedColor(color.hex)}
                presets={getColorCells()}
            />
        </Prompter>}
    </>;
};