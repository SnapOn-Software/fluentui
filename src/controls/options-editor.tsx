import { MenuItem, MessageBar, Overflow, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { AddRegular, DismissRegular, EditRegular } from "@fluentui/react-icons";
import { isNotEmptyString, isString, jsonClone, KeyValuePair } from "@kwiz/common";
import { useCallback, useMemo, useState } from "react";
import { useAlerts } from "../helpers";
import { useKWIZFluentContext } from "../helpers/context-internal";
import { ButtonEX, ButtonEXPrimarySubtle } from "./button";
import { InputEx } from "./input";
import { KWIZOverflowV2 } from "./kwizoverflow2";
import { Prompter } from "./prompt";
import { TagEx } from "./tag-ex";
import { Vertical } from "./vertical";

type optionType = KeyValuePair<string> | string;

export function OptionsEditor<ot extends optionType>(props: {
    /** set a default value for unmanaged control */
    defaultValue: optionType[];
    /** define the type for items in this collection */
    newItem: () => ot;
    onChange: (newValue: ot[]) => void;
}): JSX.Element;
export function OptionsEditor<ot extends optionType>(props: {
    /** set a value for managed control */
    value: optionType[];
    /** define the type for items in this collection */
    newItem: () => ot;
    onChange: (newValue: ot[]) => void;
}): JSX.Element;
export function OptionsEditor<ot extends optionType>(props: {
    defaultValue?: optionType[];
    value?: optionType[];
    newItem: () => ot;
    onChange: (newValue: ot[]) => void;
}): JSX.Element {
    const ctx = useKWIZFluentContext();
    const alerts = useAlerts();
    const [stateValues, setStateValues] = useState(props.defaultValue);

    const isKeyValue = useMemo(() => {
        return isString(props.newItem()) ? false : true;
    }, []);

    const value: ot[] = useMemo(() => {
        const valueArr = Array.isArray(props.value)
            ? props.value
            : Array.isArray(props.defaultValue)
                ? stateValues
                : [];

        //normalize value to conform with newItem type
        return valueArr.map(o => {
            const normalized = isKeyValue
                ? isString(o) ? { key: o as string, value: o as string } : o
                : isString(o) ? o : o.key;
            return normalized as ot;
        });
    }, [props.value, stateValues, isKeyValue]);

    const setValue = useCallback((newValue: ot[]) => {
        setStateValues(newValue);
        props.onChange(newValue);
    }, []);

    return <>
        {alerts.alertPrompt}
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>{ctx.strings?.lbl_value?.() || "Value"}</TableHeaderCell>
                    {isKeyValue && <TableHeaderCell>{ctx.strings?.lbl_text?.() || "Text"}</TableHeaderCell>}
                    <TableHeaderCell></TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {value.map((v, i) => <TableRow key={i}>
                    <TableCell><InputEx placeholder={ctx.strings?.placeholder_input?.() || "Enter value here"} value={isString(v) ? v : v.key} onChange={(e, data) => {
                        const newValue = jsonClone(value);
                        if (isString(newValue[i]))
                            newValue[i] = data.value as ot;
                        else
                            newValue[i].key = data.value;
                        setValue(newValue);
                    }} /></TableCell>
                    {(isKeyValue && !isString(v)) && <TableCell><InputEx placeholder={ctx.strings?.placeholder_input?.({ context: "text" }) || "Enter text here"} value={v.value} onChange={(e, data) => {
                        const newValue = jsonClone(value);
                        if (isString(newValue[i])) return;//no value
                        newValue[i].value = data.value;
                        setValue(newValue);
                    }} /></TableCell>}
                    <TableCell>
                        <ButtonEX icon={<DismissRegular />} title={ctx.strings?.btn_remove?.() || "Remove"}
                            onClick={() => alerts.confirmEX(ctx.strings?.confirm_remove?.({ context: "option" }) || "Are you sure you want to remove this option?", () => {
                                const newValue = jsonClone(value);
                                newValue.splice(i, 1);
                                setValue(newValue);
                            })} />
                    </TableCell>
                </TableRow>)}
                <TableRow>
                    <TableCell colSpan={3}>
                        <ButtonEX icon={<AddRegular />} title={ctx.strings?.add_custom?.({ cap: true, param: ctx.strings?.option() || "option" }) || "Add option"} showTitleWithIcon onClick={() => {
                            const newValue = jsonClone(value);
                            newValue.push(props.newItem());
                            setValue(newValue);
                        }} />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </>;
}

export function OptionsEditorInDialog<ot extends optionType>(props: {
    value?: ot[];
    newItem: () => ot;
    /** removes empty options (empty string or key) */
    onChange: (newValue: ot[]) => Promise<{ success: boolean; error?: string; }>;
}) {
    const ctx = useKWIZFluentContext();
    const value = props.value || [];
    const [showEdit, setShowEdit] = useState(false);
    const [error, setError] = useState<string>();
    const [editValues, setEditValues] = useState<ot[]>();
    const [inProgress, setInProgress] = useState(false);

    return <>
        {showEdit && <Prompter title={ctx.strings?.btn_edit_param?.({ param: ctx.strings?.options?.() || "options" }) || "Edit options"} okButtonText={ctx.strings?.btn_save?.() || "Save"} okButtonProps={{ appearance: "primary", disabled: inProgress }}
            onCancel={() => setShowEdit(false)}
            onOK={async () => {
                setInProgress(true);

                const result = await props.onChange(editValues.filter(o => isString(o) ? isNotEmptyString(o) : isNotEmptyString(o.key)));
                if (!result.success) {
                    setError(result.error || "Something went wrong");
                }
                else setShowEdit(false);

                setInProgress(false);
            }}>
            <Vertical>
                {isNotEmptyString(error) && <MessageBar intent="error">{error}</MessageBar>}
                <OptionsEditor value={editValues} newItem={props.newItem} onChange={newValue => setEditValues(newValue)} />
            </Vertical>
        </Prompter>}
        <KWIZOverflowV2 items={value} renderItem={(item => Overflow
            ? <MenuItem>{isString(item) ? item : item.value}</MenuItem>
            : <TagEx text={isString(item) ? item : item.value} size="extra-small" />
        )}><ButtonEXPrimarySubtle icon={<EditRegular />} title={ctx.strings?.btn_edit?.() || "Edit"} onClick={() => {
            setError(null);
            setEditValues(value);
            setShowEdit(true);
        }} /></KWIZOverflowV2>
    </>;
}