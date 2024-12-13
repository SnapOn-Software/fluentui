import { DatePicker, DatePickerProps } from '@fluentui/react-datepicker-compat';
import { TimePicker, TimePickerProps } from '@fluentui/react-timepicker-compat';

import { CalendarCancelRegular } from '@fluentui/react-icons';
import { isDate, isFunction, isNullOrEmptyString, isNullOrUndefined } from '@kwiz/common';
import * as React from 'react';
import { useKWIZFluentContext } from '../helpers/context';
import { useEffectOnlyOnMount } from '../helpers/hooks';
import { Horizontal } from './horizontal';

interface IProps extends Omit<DatePickerProps, 'onChange'> {
    onOK?: () => void;
    onCancel?: () => void;
    onDateChange: (newDateObject: Date) => void;
    initialDate: Date
    showTime?: boolean;
    timePickerProps?: TimePickerProps
}
export const DatePickerEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const [showClear, setShowClear] = React.useState(isDate(props.initialDate));
    const [dateValue, setDateValue] = React.useState(props.initialDate);
    const [timeValue, setTimeValue] = React.useState(props.initialDate);

    const reset = React.useCallback(() => {
        showClear && setShowClear(false);
        showClear && setDateValue(undefined);
    }, [showClear]);

    const changeDateHandler = React.useCallback(
        (newDateValue: Date): void => {
            const newDate = new Date(
                newDateValue
            );
            // Use the old time values.
            newDate.setHours(
                timeValue.getHours(),
                timeValue.getMinutes(),
                timeValue.getSeconds(),
                timeValue.getMilliseconds()
            );
            props.onDateChange(newDate);
            setDateValue(newDate);
        },
        [timeValue]
    );

    const changeTimeHandler = React.useCallback(
        (newTimeValue: Date): void => {
            // Use the old date value.
            const newDate = new Date(
                dateValue
            );
            newDate.setHours(
                newTimeValue.getHours(),
                newTimeValue.getMinutes(),
                newTimeValue.getSeconds(),
                newTimeValue.getMilliseconds()
            );
            props.onDateChange(newDate);
            setTimeValue(newDate);
        },
        [dateValue]
    );

    const DatePickerControl = <DatePicker
        {...props}
        appearance={ctx.inputAppearance}
        mountNode={ctx.mountNode}
        value={dateValue}
        onSelectDate={(newDate) => {
            setShowClear(isDate(newDate));
            changeDateHandler(newDate);
        }}
        onChange={(__, date) => {
            // ask Shai: if we need this?
        }}
        onKeyDown={isFunction(props.onOK) || isFunction(props.onCancel)
            ? e => {
                if (isFunction(props.onOK) && e.key === "Enter") props.onOK();
                else if (isFunction(props.onCancel) && e.key === "Escape") props.onCancel();
            }
            : undefined
        }
        contentBefore={showClear && <CalendarCancelRegular title='Clear' onClick={() => reset()} />}
    />

    const TimePickerControl = <TimePicker
        appearance={ctx.inputAppearance}
        mountNode={ctx.mountNode}
        {...props.timePickerProps}
        value={timeValue.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true })}
        onTimeChange={(e, date) => {
            const newDate = date.selectedTime;
            changeTimeHandler(newDate);
        }}
        onChange={(e) => {
            // ask Shai: if we need this?
        }}
        onKeyDown={isFunction(props.onOK) || isFunction(props.onCancel)
            ? e => {
                if (isFunction(props.onOK) && e.key === "Enter") props.onOK();
                else if (isFunction(props.onCancel) && e.key === "Escape") props.onCancel();
            }
            : undefined
        }
    />

    return (
        <>
            {
                props.showTime ? <Horizontal>
                    {DatePickerControl}
                    {TimePickerControl}
                </Horizontal> :
                    { DatePickerControl }
            }
        </>
    );
}