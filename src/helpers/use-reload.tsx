import { debounce, firstIndexOf } from "@kwiz/common";
import { useCallback, useState } from "react";
import { useStateEX } from "./hooks";

export interface iUseReloadTracker {
    /** marker to set as dependency */
    reloadKey: number;
    /** call to reload */
    reload: () => void;
    /** state: is there pending promises in the queue */
    isLoading: boolean;
    /** add a loading promise to the queue */
    queue: (promise: Promise<any>) => void;
}
/** a simple reload marker, can be used as a dependency, and called as a function */
export function useReloadTracker(): iUseReloadTracker {
    const [reloadKey, setReload] = useState(1);
    const reload = useCallback(debounce(() => { setReload(reloadKey + 1); }, 100), [reloadKey]);
    const queue = useCallback((promise: Promise<any>) => {
        setLoading(true);
        const myId = counter++;
        promises.push({ id: myId, promise });
        promise.finally(() => {
            //remove this promise
            const myIndex = firstIndexOf(promises, p => p.id === myId);
            promises.splice(myIndex, 1);
            //if no more promises - set loading to false
            if (promises.length === 0) setLoading(false);
        });
    },[]);
    const [isLoading, setLoading] = useStateEX(true, { skipUpdateIfSame: true });
    const promises: { id: number; promise: Promise<any> }[] = [];
    let counter = 1;

    return {
        reloadKey, reload, isLoading, queue
    };
}