import { CommonLogger, IDictionary } from "@kwiz/common";
import { useCallback, useRef } from "react";

const logger = new CommonLogger("useIsConcurrent");

/** 
 * Call at the beginning of a useEffect, check after all your promises finished before applying results to state.
 * You must keep the same name for each useEffect
 * const {getConcurrency} = useIsConcurrent();
 * useEffect(()=>{
 *      const c = getConcurrency('loading data');
 *      const result = await someSlowPromise();
 *      if( c.isCurrent() ) setData(result);
 * },[]);
 */
export function useIsConcurrent() {
    const keys = useRef<IDictionary<number>>({});

    const isCurrent = useCallback((effectName: string, value: number) => {
        const isConcurrent = keys.current[effectName] === value;
        if (!isConcurrent) logger.log(`${effectName}:${value} is not concurrent`);
        return isConcurrent;
    }, []);

    return {
        isCurrent,
        /** effectName must be unique for each useEffect */
        getConcurrency: (effectName: string) => {
            const myValue = (keys.current[effectName] > 0 ? keys.current[effectName] : 0) + 1;
            //update ref
            keys.current[effectName] = myValue;

            logger.log(`${effectName}:${myValue} started`);
            return {
                value: myValue,
                isCurrent: () => isCurrent(effectName, myValue)
            };
        }
    };
}