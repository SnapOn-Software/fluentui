import { DatePicker, DatePickerProps } from '@fluentui/react-datepicker-compat';
import { TimePicker, TimePickerProps } from '@fluentui/react-timepicker-compat';

import { CalendarCancelRegular } from '@fluentui/react-icons';
import { isDate } from '@kwiz/common';
import * as React from 'react';
import { useKWIZFluentContext } from '../helpers/context';
import { Horizontal } from './horizontal';

interface IProps {
    onDateChange: (newDateObject: Date) => void;
    value: Date;
    showTime?: boolean;
    datePickerProps?: DatePickerProps;
    timePickerProps?: TimePickerProps;
}
export const DatePickerEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();

    const { showClear, dateValue, timeValue } = React.useMemo(() => {
        const showClear = isDate(props.value);
        const dateValue = props.value;
        const timeValue = props.value;
        return { showClear, dateValue, timeValue };
    }, [props.value]);

    function reset() {
        props.onDateChange(null);
    }

    const changeDateHandler = React.useCallback((newDateValue: Date): void => {
        const newDate = new Date(newDateValue);
        // Use the old time values.
        newDate.setHours(
            timeValue.getHours(),
            timeValue.getMinutes(), 0, 0
        );
        props.onDateChange(newDate);
    }, [timeValue]);

    const changeTimeHandler = React.useCallback((newTimeValue: Date): void => {
        // Use the old date value.
        const newDate = new Date(dateValue);
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
        value={dateValue}
        onSelectDate={(newDate) => {
            changeDateHandler(newDate);
        }}
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