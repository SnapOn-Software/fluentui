import { isFunction, isNotEmptyArray, isNullOrEmptyString, isPrimitiveValue, jsonClone, jsonStringify, LoggerLevel, objectsEqual, wrapFunction } from "@kwiz/common";
import { MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { GetLogger } from "../_modules/config";

/** Empty array ensures that effect is only run on mount */
export const useEffectOnlyOnMount = [];

/** set state on steroids. provide promise callback after render, onChange transformer and automatic skip-set when value not changed */
export function useStateEX<ValueType>(initialValue: ValueType, options?: {
    onChange?: (newValue: SetStateAction<ValueType>, isValueChanged: boolean) => SetStateAction<ValueType>;
    //will not set state if value did not change
    skipUpdateIfSame?: boolean;
    //optional, provide a name for better logging
    name?: string;
}):
    [ValueType, (newValue: SetStateAction<ValueType>) => Promise<ValueType>, MutableRefObject<ValueType>] {
    options = options || {};
    const name = options.name || '';

    let logger = GetLogger(`useStateWithTrack${isNullOrEmptyString(name) ? '' : ` ${name}`}`);
    logger.setLevel(LoggerLevel.WARN);

    const [value, setValueInState] = useState(initialValue);
    const currentValue = useRef(value);

    /** make this a collection in case several callers are awaiting the same propr update */
    const resolveState = useRef<((v: ValueType) => void)[]>([]);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, useEffectOnlyOnMount);

    function resolvePromises() {
        if (isNotEmptyArray(resolveState.current)) {
            let resolvers = resolveState.current.slice();
            resolveState.current = [];//clear
            resolvers.map(r => r(currentValue.current));
        }
    };
    useEffect(() => {
        resolvePromises();
        if (isNotEmptyArray(resolveState.current)) {
            logger.log(`resolved after render`);
            let resolvers = resolveState.current.slice();
            resolveState.current = [];//clear
            resolvers.map(r => r(value));
        }
    }, [value, resolveState.current]);

    function getIsValueChanged(newValue: ValueType): boolean {
        return logger.groupSync('getIsValueChanged', log => {
            if (logger.getLevel() === LoggerLevel.VERBOSE) {
                log('old: ' + jsonStringify(currentValue.current));
                log('new: ' + jsonStringify(newValue));
            }
            if (!objectsEqual(newValue as object, currentValue.current as object)) {
                log(`value changed`);
                return true;
            }
            else {
                log(`value unchanged`);
                return false;
            }
        });
    };

    let setValueWithCheck = !options.skipUpdateIfSame ? setValueInState : (newValue: ValueType) => {
        const isValueChanged = getIsValueChanged(newValue);
        if (isValueChanged) {
            setValueInState(newValue);
        }
        else {
            resolvePromises();
        }
    }


    let setValueWithEvents = wrapFunction(setValueWithCheck, {
        before: (newValue: ValueType) => isFunction(options.onChange) ? options.onChange(newValue, getIsValueChanged(newValue)) : newValue,
        after: (newValue: ValueType) => currentValue.current = isPrimitiveValue(newValue) || isFunction(newValue)
            ? newValue
            //fix skipUpdateIfSame for complex objects
            //if we don't clone it, currentValue.current will be a ref to the value in the owner
            //and will be treated as unchanged object, and it will be out of sync
            //this leads to skipUpdateIfSame failing after just 1 unchanged update
            : jsonClone(newValue) as ValueType
    });

    const setValue = useCallback((newState: ValueType) => new Promise<ValueType>(resolve => {
        if (!isMounted.current) {
            //unmounted may never resolve
            logger.log(`resolved without wait`);
            resolve(newState);
        }
        else {
            resolveState.current.push(resolve);
            setValueWithEvents(newState);
        }
    }), []);

    return [value, setValue, currentValue];
}