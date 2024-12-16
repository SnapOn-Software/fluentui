import { makeStyles } from "@fluentui/react-components";
import { useEffect, useState } from "react";

export interface iKWIZFluentContext {
    /**
     * Where the portal children are mounted on DOM
     *
     * @default a new element on document.body without any styling
     */
    mountNode?: HTMLElement | null | {
        element?: HTMLElement | null;
        className?: string;
    }
    /**
     * Controls the colors and borders of the input.
     * 
     * @default 'underline'
     */
    inputAppearance?: 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';

    /**
     * A button can be rounded, circular, or square.
     *
     * @default 'rounded'
     */
    buttonShape?: 'rounded' | 'circular' | 'square';
}

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
    return kwizFluentContext;
}