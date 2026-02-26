import { CommonLogger, debounce, firstIndexOf, firstOrNull, isNotEmptyString, isNullOrEmptyString, isNumber, jsonClone, promiseOnce } from "@kwiz/common";
import { isValidElement, useCallback, useMemo } from "react";
import { iLoadingProps, Loading } from "../controls/loading";
import { iPleaseWaitProps, PleaseWait } from "../controls/please-wait";
import { useStateEX } from "./hooks";

const logger = new CommonLogger("useReloadTracker");

type queueType = "required" | "optional";
type isLoadingType = { type: queueType, label?: string; };

export interface iUseReloadTracker<Scope extends string = "global"> {
    /** marker to set as dependency when you want to re-run the effect when reload was called */
    reloadKey: { [key in withGlobal<Scope>]?: number; };
    /** call to reload scope+global, or send global to reload all scopes */
    reload: (scope?: Scope) => void;
    /** state: is there pending promises in the queue */
    isLoading: isLoadingType | false;
    /** add a loading promise to the queue */
    queue: <Result, >(promise: () => Promise<Result>, info: {
        label: string; type?: queueType,
        /** will use promiseOnce if provided, along with the reload key */
        cacheKey: string;
        /** switch reloadKey scope for cacheKey. Global will update on any reload. You want to set this if you have a dependency on reloadKey.[scope] that is not global */
        cacheScope?: Scope;
    }) => Promise<Result>;
    /** render loading animation, or track isLoading to add animation yourself */
    reloadElement?: JSX.Element;
}

type withGlobal<t extends string> = t | "global";

/** a simple reload marker, can be used as a dependency, and called as a function */
export function useReloadTracker<Scope extends string = "global">(props?: {
    requiredElement?: Partial<iLoadingProps> | JSX.Element;
    optionalElement?: Partial<iPleaseWaitProps> | JSX.Element;
}): iUseReloadTracker<Scope> {
    type scopeType = withGlobal<Scope>;
    const [reloadKey, setReload, reloadKeyRef] = useStateEX<{ [key in scopeType]?: number; }>({ global: 1 });

    const promises: { id: number; type: queueType; label: string; }[] = [];
    let counter = 1;

    const reload = useCallback(debounce((scope: scopeType) => {
        const rk = jsonClone(reloadKey);
        if (scope === "global" || isNullOrEmptyString(scope)) {
            //if global - notify all listeners
            Object.keys(rk).forEach(s => {
                rk[s] = (isNumber(rk[s]) ? rk[s] : 0) + 1;
            });
            logger.debug('Reload all scopes');
        }
        else {
            //notify only listeners for my scope + global listeners
            rk[scope] = (isNumber(rk[scope]) ? rk[scope] : 0) + 1;
            rk.global++;
            logger.debug(`Reload ${scope}: ${rk[scope]}, and global: ${rk.global}`);
        }
        setReload(rk);
    }, 100), [reloadKey]);

    const [isLoading, setLoading, isLoadingRef] = useStateEX<isLoadingType | false>(false, { skipUpdateIfSame: true });

    //this does not have dependencies, never changes, so unsafe to use state. use stateRef objects.
    const queue = useCallback<iUseReloadTracker<Scope>["queue"]>(async (promise, info) => {
        const type = info?.type || "optional";
        if ((isLoadingRef.current as isLoadingType)?.type !== "required")//if its required - do not update this back to optional
            setLoading({ type, label: info.label });

        const myId = counter++;
        promises.push({ id: myId, type, label: info?.label });

        try {
            return (isNotEmptyString(info.cacheKey)
                ? (() => {
                    const cache_reloadKey = isNotEmptyString(info.cacheScope) ? `${info.cacheScope}:${reloadKeyRef.current[info.cacheScope] || 0}` : `global:${reloadKeyRef.current.global}`;
                    const promiseOnceCacheKey = `${cache_reloadKey}|${info.cacheKey}`;
                    logger.log(promiseOnceCacheKey);
                    return promiseOnce(promiseOnceCacheKey, promise);
                })()
                : promise()
            );
        } finally {
            //remove this promise
            const myIndex = firstIndexOf(promises, p => p.id === myId);
            promises.splice(myIndex, 1);
            //if no more promises - set loading to false
            if (promises.length === 0) setLoading(false);

            //else, if it is state required and no more required promiese - drop it to optional
            else {
                //drop the label/type to the next promise in queue, prioritize required ones.
                const nextPromise = firstOrNull(promises, p_1 => p_1.type === "required") || promises[0];
                setLoading({ type: nextPromise.type, label: nextPromise.label });
            }
        }
    }, []);

    const reloadElement = useMemo(() => (isLoading as isLoadingType)?.type === "required"
        ? isValidElement(props?.requiredElement) ? props.requiredElement
            : <Loading fullsize label={(isLoading as isLoadingType).label} {...props?.requiredElement} />
        : (isLoading as isLoadingType)?.type === "optional"
            ? isValidElement(props?.optionalElement) ? props.optionalElement
                : <PleaseWait label={(isLoading as isLoadingType).label} {...props?.optionalElement} />
            : undefined, [isLoading]);

    return {
        reloadKey, reload, isLoading, queue, reloadElement
    };
}

/** examples
 * =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
 * in your main/top control or in your context provider, call:
 *      const rt = useReloadTracker();
 * render its content:
 *      {rt.reloadElement}
 * 
 * load content that never changes, and cached (type:'required' will cover the page content while this is pending):
 *   useEffect(() => {
 *     queue(() => ASYNC_ACTION(), { label:'Loading XXX', cacheKey: 'ASYNC_ACTION', type: "required" })
 *       .then(result => setResult(result));
 *   }, [queue]);
 * 
 * load content that changes based on other state, and cached:
 *   useEffect(() => {
 *     queue(() => ASYNC_ACTION(STATE1), { label:'Loading XXX', cacheKey: `ASYNC_ACTION|${STATE1}` })
 *       .then(result => setResult(result));
 *   }, [queue, STATE1]);
 * 
 * load content that changes when you call reload anywhere:
 *   useEffect(() => {
 *     queue(() => ASYNC_ACTION(), { label:'Loading XXX', cacheKey: 'ASYNC_ACTION' })
 *       .then(result => setResult(result));
 *   }, [queue, reloadKey.global]);
 * 
 * load content that changes when you call reload('scope1') anywhere:
 *   useEffect(() => {
 *     queue(() => ASYNC_ACTION(), { label:'Loading XXX', cacheKey: 'ASYNC_ACTION', cacheScope: 'scope1' })
 *       .then(result => setResult(result));
 *   }, [queue, reloadKey.scope1]);
 * 
 */