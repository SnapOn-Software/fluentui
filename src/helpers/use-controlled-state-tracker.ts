import { CommonLogger, isUndefined } from "@kwiz/common";
import { useEffect, useState } from "react";

const logger = new CommonLogger("useControlledStateTracker");

export function useControlledStateTracker<ValueType>(props: { name: string; value?: ValueType; defaultValue?: ValueType }) {
    const [isUnControlled, setIsUnControlled] = useState(!isUndefined(props.defaultValue));

    const __isUnControlled = !isUndefined(props.defaultValue);
    useEffect(() => {
        if (__isUnControlled !== isUnControlled) {
            logger.error(`${props.name} control was switched from controlled to uncontrolled mode. This is not supported.`);
            setIsUnControlled(__isUnControlled);
            if (!__isUnControlled) {
                setUncontrolledSelected(props.value);
            }
        }
    }, [__isUnControlled, isUnControlled]);

    const [uncontrolledSelected, setUncontrolledSelected] = useState(isUnControlled ? props.defaultValue : props.value);

    const valueToUse = isUnControlled ? uncontrolledSelected : props.value;
    return { valueToUse, setValue: setUncontrolledSelected };
}