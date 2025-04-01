import { makeStyles } from "@fluentui/react-components";
import { isFunction, isNotEmptyArray, isNullOrEmptyString, isPrimitiveValue, jsonClone, jsonStringify, LoggerLevel, objectsEqual } from "@kwiz/common";
import { HTMLAttributes, MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { GetLogger } from "../_modules/config";
import { mixins } from "../styles/styles";

/** Empty array ensures that effect is only run on mount */
export const useEffectOnlyOnMount = [];

type stateExOptions<ValueType> = {
    onChange?: (newValue: ValueType, isValueChanged: boolean) => ValueType;
    //will not set state if value did not change
    skipUpdateIfSame?: boolean;
    //optional, provide a name for better logging
    name?: string;
};
function extractStringValue(e: any) {
    try {
        if (e instanceof HTMLElement)
            return e.outerHTML;
    } catch (e) { }
    try {
        let json = jsonStringify(e);
        if (json === "{}") return Object.keys(e).join();//maybe just object with functions, no members or values
        else return json;
    } catch (e) { }
    try {
        return e.toString();
    } catch (e) { }
    return '';
}
/** set state on steroids. provide promise callback after render, onChange transformer and automatic skip-set when value not changed */
export function useStateEX<ValueType>(initialValue: ValueType, options?: stateExOptions<ValueType>):
    [ValueType, (newValue: SetStateAction<ValueType>) => Promise<ValueType>, MutableRefObject<ValueType>] {
    options = options || {};
    const name = options.name || '';

    let logger = GetLogger(`useStateWithTrack${isNullOrEmptyString(name) ? '' : ` ${name}`}`);
    logger.setLevel(LoggerLevel.WARN);

    const [value, setValueInState] = useState<ValueType>(initialValue);

    const currentValue = useRef<ValueType>();
    //json clone complex/ref values so we can compare if value changed, in case caller makes chagnes on the value object directly.
    const currentValueForChecks = useRef<ValueType>();
    useEffect(() => {
        updateCurrentRef(initialValue);
    }, useEffectOnlyOnMount);

    //keep a ref to onChange so the caller's latet state is accessible
    const onChange = useRef(options.onChange);
    onChange.current = options.onChange;

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
    }, [value]);

    function getIsValueChanged(newValue: ValueType): boolean {
        let error: Error = null;
        let result: boolean;
        try {
            if (!objectsEqual(newValue as object, currentValueForChecks.current as object)) {
                result = true;
            }
            else {
                result = false;
            }
        } catch (e) {
            error = e;
            result = true;
        }

        return logger.groupSync(result ? 'value changed' : 'value not changed', log => {
            if (logger.getLevel() === LoggerLevel.VERBOSE) {
                log('old: ' + extractStringValue(currentValueForChecks.current));
                log('new: ' + extractStringValue(newValue));
                if (error) log({ label: "Error", value: error });
            }
            return result;
        });
    };
    function updateCurrentRef(newValue: ValueType) {
        currentValue.current = newValue;
        currentValueForChecks.current = isPrimitiveValue(newValue) || isFunction(newValue)
            ? newValue
            //fix skipUpdateIfSame for complex objects
            //if we don't clone it, currentValue.current will be a ref to the value in the owner
            //and will be treated as unchanged object, and it will be out of sync
            //this leads to skipUpdateIfSame failing after just 1 unchanged update
            : jsonClone(newValue) as ValueType;
    }

    const setValue = useCallback((newState: ValueType) => new Promise<ValueType>(resolve => {
        if (!isMounted.current) {
            //unmounted may never resolve
            logger.log(`resolved without wait`);
            resolve(newState);
        }
        else {
            resolveState.current.push(resolve);
            const isChanged = isFunction(onChange.current) || options.skipUpdateIfSame
                ? getIsValueChanged(newState)//don't call this if there is no onChange handler and if we don't need to monitor skipUpdateIfSame
                : true;
            if (isFunction(onChange.current))
                newState = onChange.current(newState, isChanged);

            //keep current value ref up to date
            updateCurrentRef(newState);

            //set state
            if (!options.skipUpdateIfSame || isChanged)
                setValueInState(newState);
            else//don't set in state - just resolve pending promises, UI will not be updated.
                resolvePromises();
        }
    }), useEffectOnlyOnMount);

    return [value, setValue, currentValue];
}

/** use a ref, that can be tracked as useEffect dependency */
export function useRefWithState<T>(initialValue?: T, stateOptions: stateExOptions<T> = { skipUpdateIfSame: true, name: "useRefWithState" }) {
    let asRef = useRef<T>(initialValue);
    let [asState, setState] = useStateEX<T>(initialValue, stateOptions);
    let setRef = useCallback((newValue: T) => {
        asRef.current = newValue;
        setState(newValue);
    }, useEffectOnlyOnMount);
    return {
        /** ref object for getting latest value in handlers */
        ref: asRef,
        /** for useEffect dependency */
        value: asState,
        /** for setting on element: ref={e.set} */
        set: setRef
    };
}

const useStyles = makeStyles({
    clickable: mixins.clickable,
});

/** return props to make div appear as clickable, and accept enter key as click */
export function useClickableDiv() {
    const cssNames = useStyles();

    const props: HTMLAttributes<HTMLDivElement> = {
        className: cssNames.clickable,
        tabIndex: 0,
        onKeyDown: e => {
            if (e.key === "Enter") (e.target as HTMLDivElement).click();
        }
    };

    return props;
}