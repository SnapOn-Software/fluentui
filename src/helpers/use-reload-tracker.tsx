import { debounce, firstIndexOf, firstOrNull, isNullOrEmptyString, isNumber, jsonClone } from "@kwiz/common";
import { isValidElement, useCallback, useMemo, useState } from "react";
import { iLoadingProps, Loading } from "../controls/loading";
import { iPleaseWaitProps, PleaseWait } from "../controls/please-wait";
import { useStateEX } from "./hooks";

type queueType = "required" | "optional";

export interface iUseReloadTracker<Scope extends string = string> {
    /** marker to set as dependency when you want to re-run the effect when reload was called */
    reloadKey: { [key in withGlobal<Scope>]?: number; };
    /** call to reload */
    reload: (scope?: Scope) => void;
    /** state: is there pending promises in the queue */
    isLoading: queueType | false;
    /** add a loading promise to the queue */
    queue: (promise: Promise<any>, type?: queueType) => void;
    /** render loading animation, or track isLoading to add animation yourself */
    reloadElement?: JSX.Element;
}

type withGlobal<t extends string> = t | "global";


/** a simple reload marker, can be used as a dependency, and called as a function */
export function useReloadTracker<Scope extends string = string>(props?: {
    requiredElement?: Partial<iLoadingProps> | JSX.Element;
    optionalElement?: Partial<iPleaseWaitProps> | JSX.Element;
}): iUseReloadTracker<Scope> {
    type scopeType = withGlobal<Scope>;
    const [reloadKey, setReload] = useState<{ [key in scopeType]?: number; }>({ global: 1 });

    const promises: { id: number; promise: Promise<any>, type: queueType }[] = [];
    let counter = 1;

    const reload = useCallback(debounce((scope: scopeType) => {
        const rk = jsonClone(reloadKey);
        //if global - update all keys
        if (scope === "global" || isNullOrEmptyString(scope))
            Object.keys(rk).forEach(s => {
                rk[s] = (isNumber(rk[s]) ? rk[s] : 0) + 1;
            });
        else
            rk[scope] = (isNumber(rk[scope]) ? rk[scope] : 0) + 1;
        setReload(rk);
    }, 100), [reloadKey]);
    const [isLoading, setLoading, isLoadingRef] = useStateEX<queueType | false>(false, { skipUpdateIfSame: true });

    const queue = useCallback((promise: Promise<any>, type: queueType = "optional") => {
        if (isLoadingRef.current !== "required")//if its required - do not update this back to optional
            setLoading(type || "optional");

        const myId = counter++;
        promises.push({ id: myId, promise, type });
        promise.finally(() => {
            //remove this promise
            const myIndex = firstIndexOf(promises, p => p.id === myId);
            promises.splice(myIndex, 1);
            //if no more promises - set loading to false
            if (promises.length === 0) setLoading(false);
            //else, if it is state required and no more required promiese - drop it to optional
            else if (isLoadingRef.current === "required" && !firstOrNull(promises, p => p.type === "required"))
                setLoading("optional");
        });
    }, []);

    const reloadElement = useMemo(() => isLoading === "required"
        ? isValidElement(props?.requiredElement) ? props.requiredElement : <Loading fullsize {...props?.requiredElement} />
        : isLoading === "optional"
            ? isValidElement(props?.optionalElement) ? props.optionalElement : <PleaseWait {...props?.optionalElement} />
            : undefined, [isLoading]);

    return {
        reloadKey, reload, isLoading, queue, reloadElement
    };
}