import { makeStyles } from "@fluentui/react-components";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { iKWIZFluentContext, KWIZFluentContext } from "./context-const";
export type { iKWIZFluentContext } from "./context-const";

const useContextStyles = makeStyles({
    root: {
        "& *": {
            scrollbarWidth: "thin"
        }
    },
})

export function useKWIZFluentContextProvider(options: {
    root?: React.MutableRefObject<HTMLDivElement>;
    ctx?: iKWIZFluentContext;
}) {
    const classes = useContextStyles();
    let v: iKWIZFluentContext = options && options.ctx || {};
    const [kwizFluentContext, setKwizFluentContext] = useState<iKWIZFluentContext>(v);
    useEffect(() => {
        options.root?.current?.classList.add(...classes.root.split(' '));
        // ref only updates in useEffect, not in useMemo or anything else.
        // we need to set it into state so it will trigger a ui update
        setKwizFluentContext({
            ...v,
            mountNode: options.root.current
        });
    }, [options.root]);
    return (props: PropsWithChildren) => <KWIZFluentContext.Provider value={kwizFluentContext}>{props.children}</KWIZFluentContext.Provider>;
}