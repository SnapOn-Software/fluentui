import { isDebug, isFunction } from "@kwiz/common";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { KnownClassNames } from "../styles/styles";
import { useEffectOnlyOnMount } from "./hooks";

export function useTrackFocus<elmType extends HTMLElement>(props: { onFocus: () => void, onLoseFocus: () => void, ref?: MutableRefObject<elmType> }) {
    const wrapperDiv: MutableRefObject<elmType> = props.ref || useRef<HTMLDivElement>(null) as any;
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
export function useElementSize(elm: HTMLElement) {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [elmSize, setELmSize] = useState<{
        width: number,
        height: number
    }>({
        width: undefined,
        height: undefined
    });
    useEffect(() => {
        if (elm) {
            // Handler to call on elm resize
            function handleResize() {
                // Set elm width/height to state
                setELmSize({
                    width: (elm instanceof Window) ? elm.innerWidth : elm.clientWidth,
                    height: (elm instanceof Window) ? elm.innerHeight : elm.clientHeight,
                });
            }
            // Add event listener
            const observer = new ResizeObserver(handleResize);
            observer.observe(elm);
            // Call handler right away so state gets updated with initial elm size
            handleResize();
            // Remove event listener on cleanup
            return () => observer.disconnect();
        }
    }, [elm]);
    return elmSize;
}
export function useIsInPrint() {
    // Initialize state with media query
    const [printMode, setPrintMode] = useState<boolean>(window.matchMedia ? window.matchMedia('print').matches : false);
    useEffect(() => {
        if (printMode)
            document.body.classList.add(KnownClassNames.print);
        else
            document.body.classList.remove(KnownClassNames.print);
    }, [printMode]);

    useEffect(() => {
        const forcePrintOn = () => setPrintMode(true);
        const forcePrintOff = () => setPrintMode(false);

        function printDebugHelper(e: KeyboardEvent) {
            if (e.ctrlKey && e.shiftKey && e.altKey) {
                if (e.key.toLocaleLowerCase() === "q") {
                    forcePrintOff();
                }
                else {
                    console.warn('forced print mode - to exit refresh to ctrl+shift+alt+q');
                    forcePrintOn();
                }
            }
        }

        // Add event listener
        window.addEventListener("beforeprint", forcePrintOn);
        window.addEventListener("afterprint", forcePrintOff);
        if (isDebug())
            window.addEventListener("keydown", printDebugHelper);
        // Remove event listener on cleanup
        return () => {
            window.removeEventListener("beforeprint", forcePrintOn);
            window.removeEventListener("afterprint", forcePrintOff);
            if (isDebug())
                window.removeEventListener("keydown", printDebugHelper);
        };
    }, useEffectOnlyOnMount);
    return printMode;
}

export function useKeyDown(options: {
    //default use document
    elm?: HTMLElement | Document;
    onEnter?: (e: KeyboardEvent) => void;
    onEscape?: (e: KeyboardEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
}) {
    let elm = options.elm || document;

    useEffect(() => {
        let handler = (e: KeyboardEvent) => {
            if (e.key === "Enter" && isFunction(options.onEnter)) options.onEnter(e);
            else if (e.key === "Escape" && isFunction(options.onEscape)) options.onEscape(e);
            if (isFunction(options.onKeyDown))
                options.onKeyDown(e);
        };
        elm.addEventListener("keydown", handler);
        return () => elm.removeEventListener("keydown", handler);
    }, [elm, options.onEnter, options.onEscape, options.onKeyDown]);
}