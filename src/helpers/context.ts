import { isNullOrUndefined } from "@kwiz/common";
import React from "react";

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

//create context
export const KWIZFluentContext = React.createContext<iKWIZFluentContext>(null);
//use context from within controls
export function useKWIZFluentContext() {
    let ctx = React.useContext(KWIZFluentContext) || {};
    //set defaults
    if (isNullOrUndefined(ctx.inputAppearance))
        ctx.inputAppearance = "underline";
    if (isNullOrUndefined(ctx.mountNode))
        ctx.mountNode = document.querySelector(".fui-FluentProvider");
    if (isNullOrUndefined(ctx.buttonShape))
        ctx.buttonShape = "circular";
    return ctx;
}
