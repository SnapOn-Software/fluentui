import { useEffect } from "react";
import { useRefWithState } from "./hooks";

/** better auto-focus that actually works. use the ref on the element you wish to focus.
 * focus set initially, and then again on a timeout - default is 200ms timeout. send 0 to skip the timeout
 */
export function useAutoFocusEX({ timeout }: { timeout?: number } = { timeout: 200 }) {
    const focusableRef = useRefWithState<HTMLElement>();
    useEffect(() => {
        if (focusableRef.ref.current) {
            focusableRef.ref.current.focus();
            if (timeout > 0)
                window.setTimeout(() => focusableRef.ref.current.focus(), timeout);
        }
    }, [focusableRef.value, timeout]);
    return { set: focusableRef.set }
}