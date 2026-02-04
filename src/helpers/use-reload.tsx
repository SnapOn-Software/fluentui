import { debounce } from "@kwiz/common";
import { useCallback, useState } from "react";

export interface iUseReload {
    /** marker to set as dependency */
    key: number;
    /** call to reload */
    reload: () => void;
}
/** a simple reload marker, can be used as a dependency, and called as a function */
export function useReload(): iUseReload {
    const [key, setReload] = useState(1);
    const reload = useCallback(() => debounce(() => { setReload(key + 1); }, 100), [key]);
    return { key, reload };
}