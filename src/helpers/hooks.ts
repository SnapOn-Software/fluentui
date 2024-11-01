import { isDebug, isFunction, isNotEmptyArray, isNullOrEmptyString, jsonStringify, LoggerLevel, objectsEqual, wrapFunction } from "@kwiz/common";
import { MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { GetLogger } from "../_modules/config";
import { KnownClassNames } from "../styles/styles";

const logger = GetLogger("helpers/hooks");
/** Empty array ensures that effect is only run on mount */
export const useEffectOnlyOnMount = [];

/** set state on steroids. provide promise callback after render, onChange transformer and automatic skip-set when value not changed */
export function useStateEX<ValueType>(initialValue: ValueType, options?: {
    onChange?: (newValue: SetStateAction<ValueType>) => SetStateAction<ValueType>;
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

    let setValueWithCheck = !options.skipUpdateIfSame ? setValueInState : (newValue: ValueType) => {
        logger.groupSync('conditional value change', log => {
            if (logger.getLevel() === LoggerLevel.VERBOSE) {
                log('old: ' + jsonStringify(currentValue.current));
                log('new: ' + jsonStringify(newValue));
            }
            if (!objectsEqual(newValue as object, currentValue.current as object)) {
                log(`value changed`);
                setValueInState(newValue);
            }
            else {
                log(`value unchanged`);
                resolvePromises();
            }
        });
    }


    let setValueWithEvents = wrapFunction(setValueWithCheck, {
        before: newValue => isFunction(options.onChange) ? options.onChange(newValue) : newValue,
        after: newValue => currentValue.current = newValue as ValueType
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
export function useTrackFocus(props: { onFocus: () => void, onLoseFocus: () => void, ref?: MutableRefObject<HTMLElement> }) {
    const wrapperDiv = props.ref || useRef<HTMLDivElement>(null);
    useEffect(() => {
        function focusIn(e: FocusEvent) {
            let elm = e.target as HTMLElement;//document.activeElement;
            if (wrapperDiv.current) {
                while (elm && elm !== wrapperDiv.current) {
                    elm = elm.parentElement;
                }
            } else elm = null;
            if (wrapperDiv.current && elm === wrapperDiv.current) props.onFocus();
            else props.onLoseFocus();
        }

        if (wrapperDiv.current) {
            if (wrapperDiv.current) wrapperDiv.current.tabIndex = 1;
            window.addEventListener("focusin", focusIn);
            // Remove event listener on cleanup
            return () => window.removeEventListener("focusin", focusIn);
        }
    }, [wrapperDiv.current]);
    return wrapperDiv;
}
export function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState<{
        width: number,
        height: number
    }>({
        width: undefined,
        height: undefined
    });
    useEffect(() => {
        // Handler to call on window resize
        function handleResize() {

            // Set window width/height to state
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        // Add event listener
        window.addEventListener("resize", handleResize);
        // Call handler right away so state gets updated with initial window size
        handleResize();
        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, useEffectOnlyOnMount);
    return windowSize;
}
export function useIsInPrint() {
    // Initialize state with false
    const [printMode, setPrintMode] = useState<boolean>(false);
    useEffect(() => {
        function forcePrint(e: KeyboardEvent) {
            if (e.ctrlKey && e.shiftKey && e.altKey) {
                if (e.key.toLocaleLowerCase() === "q") {
                    document.body.classList.remove(KnownClassNames.print);
                    handlePrint(e, false);
                }
                else {
                    console.warn('forced print mode - to exit refresh to ctrl+shift+alt+q');
                    document.body.classList.add(KnownClassNames.print);
                    handlePrint(e, true);
                }
            }
        }
        // Handler to call on printing
        function handlePrint(e?: Event, force?: boolean) {
            if (force === true) setPrintMode(true);
            else if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                if (mediaQueryList.matches) {
                    setPrintMode(true);
                } else {
                    setPrintMode(false);
                }
            }
        }
        // Add event listener
        window.addEventListener("print", handlePrint);
        if (isDebug())
            window.addEventListener("keydown", forcePrint);
        // Call handler right away so state gets updated with initial printing state
        handlePrint();
        // Remove event listener on cleanup
        return () => {
            window.removeEventListener("print", handlePrint);
            if (isDebug())
                window.removeEventListener("keydown", forcePrint);
        };
    }, useEffectOnlyOnMount);
    return printMode;
}
