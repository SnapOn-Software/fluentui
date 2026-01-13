import { DatePicker, DatePickerProps } from '@fluentui/react-datepicker-compat';
import { TimePicker, TimePickerProps } from '@fluentui/react-timepicker-compat';

import { CalendarCancelRegular } from '@fluentui/react-icons';
import { isDate } from '@kwiz/common';
import * as React from 'react';
import { useStateEX } from '../helpers';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { Horizontal } from './horizontal';

interface IProps {
    onDateChange: (newDateObject: Date) => void;
    value: Date;
    showTime?: boolean;
    datePickerProps?: DatePickerProps;
    timePickerProps?: TimePickerProps;
    /** don't allow to clear the value */
    required?: boolean;
}
export const DatePickerEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();

    //time value will always have a value even when clearing the date
    const [timeValue, setTimeValue] = useStateEX<Date>(isDate(props.value) ? props.value : new Date());
    const { showClear, dateValue } = React.useMemo(() => {
        const showClear = !props.required && isDate(props.value);
        const dateValue = props.value;
        return { showClear, dateValue };
    }, [props.value]);

    function reset() {
        props.onDateChange(null);
    }

    const changeDateHandler = React.useCallback((newDateValue: Date): void => {
        const newDate = new Date(newDateValue);
        // Use the old time values.
        newDate.setHours(
            timeValue ? timeValue.getHours() : 0,
            timeValue ? timeValue.getMinutes() : 0, 0, 0
        );
        props.onDateChange(newDate);
    }, [timeValue, props.onDateChange]);

    const changeTimeHandler = React.useCallback((newTimeValue: Date): void => {
        //update our state
        setTimeValue(newTimeValue);
        // Use the old date value.
        const newDate = isDate(dateValue) ? new Date(dateValue) : new Date();
        newDate.setHours(
            newTimeValue.getHours(),
            newTimeValue.getMinutes(), 0, 0
        );
        props.onDateChange(newDate);
    }, [dateValue]);

    const DatePickerControl = <DatePicker
        {...(props.datePickerProps || {})}
        appearance={ctx.inputAppearance}
        mountNode={ctx.mountNode}
        value={isDate(dateValue) ? dateValue : null}
        onSelectDate={(newDate) => {
            changeDateHandler(newDate);
        }}
        contentBefore={showClear && <CalendarCancelRegular title={ctx.strings?.btn_clear?.({ cap: true }) || 'Clear'} onClick={() => reset()} />}
    />

    const TimePickerControl = <TimePicker
        appearance={ctx.inputAppearance}
        mountNode={ctx.mountNode}
        {...props.timePickerProps}
        //only show time value when there is a selected date. timeValue will never be null.
        value={isDate(dateValue) ? timeValue.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
        onTimeChange={(e, date) => {
            const newDate = date.selectedTime;
            changeTimeHandler(newDate);
        }}
    />

    return (
        props.showTime
            ? <Horizontal>
                {DatePickerControl}
                {TimePickerControl}
            </Horizontal>
            : DatePickerControl
    );
}