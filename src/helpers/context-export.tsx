import { makeStaticStyles, makeStyles } from "@fluentui/react-components";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { GetLogger } from "../_modules/config";
import { KnownClassNames } from "../styles";
import { iKWIZFluentContext, KWIZFluentContext } from "./context-const";
import { DragDropContextProvider } from "./drag-drop";
export type { iKWIZFluentContext } from "./context-const";
const logger = GetLogger("KWIZFluentContextProvider");
const useContextStyles = makeStyles({
    root: {
        "& *": {
            scrollbarWidth: "thin"
        },
        [`& .${KnownClassNames.printShow}`]: {
            '@media print': {
                display: 'unset',
            }
        },
        [`& .${KnownClassNames.printHide}`]: {
            '@media print': {
                display: 'none !important'
            }
        },
    },
});
export const useStaticStyles = makeStaticStyles({
    [`.${KnownClassNames.printShow}`]: {
        display: 'none'
    },
    [`body.${KnownClassNames.print} .${KnownClassNames.printHide}`]: {
        display: "none !important"
    },
    [`body.${KnownClassNames.print} .${KnownClassNames.printShow}`]: {
        display: "unset"
    }
});

/** @deprecated - use KWIZFluentProvider instead of using this + DragDropContextProvider */
export function useKWIZFluentContextProvider(options: {
    root?: React.MutableRefObject<HTMLDivElement>;
    ctx?: iKWIZFluentContext;
}) {
    useStaticStyles();
    const classes = useContextStyles();
    let v: iKWIZFluentContext = options && options.ctx || {};
    const [kwizFluentContext, setKwizFluentContext] = useState<iKWIZFluentContext>(v);
    useEffect(() => {
        if (options.root?.current) logger.warn('Sending a root node is not recommended, if you have set up your packages correctly to mark react and fluent UI as external dialogs should open correctly.');
        let styleRoot = options.root?.current || document.body;
        styleRoot.classList.add(...classes.root.split(' '));
        // ref only updates in useEffect, not in useMemo or anything else.
        // we need to set it into state so it will trigger a ui update
        setKwizFluentContext({
            ...v,
            mountNode: options.root?.current
        });
    }, [options.root]);
    return {
        KWIZFluentContext,
        value: kwizFluentContext
    };
}

export const KWIZFluentProvider = (props: PropsWithChildren<{
    ctx?: iKWIZFluentContext;
}>) => {

    const cp = useKWIZFluentContextProvider({ ctx: props.ctx });

    return <cp.KWIZFluentContext.Provider value={cp.value}>
        <DragDropContextProvider>
            {props.children}
        </DragDropContextProvider>
    </cp.KWIZFluentContext.Provider>;
}