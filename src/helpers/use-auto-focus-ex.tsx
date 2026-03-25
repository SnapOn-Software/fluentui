import { isNullOrUndefined } from "@kwiz/common";
import { useEffect } from "react";
import { useRefWithState } from "./hooks";

/** better auto-focus that actually works. use the ref on the element you wish to focus.
 * focus set initially, and then again on a timeout - default is 200ms timeout. send 0 to skip the timeout
 */
export function useAutoFocusEX({ timeout }: { timeout?: number }) {
    const focusableRef = useRefWithState<HTMLElement>();
    useEffect(() => {
        if (focusableRef.ref.current) {
            const useTimeout = isNullOrUndefined(timeout) || timeout > 0;
            focusableRef.ref.current.focus();
            if (useTimeout)
                window.setTimeout(() => focusableRef.ref.current.focus(), timeout > 0 ? timeout : 200);
        }
    }, [focusableRef.value, timeout]);
    return { set: focusableRef.set }
}