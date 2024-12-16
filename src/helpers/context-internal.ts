import { isNullOrUndefined } from "@kwiz/common";
import React from "react";
import { iKWIZFluentContext } from "./context-export";


//create context
export const KWIZFluentContext = React.createContext<iKWIZFluentContext>(null);
//use context from within controls
export function useKWIZFluentContext() {
    let ctx = React.useContext(KWIZFluentContext) || {};
    //set defaults
    if (isNullOrUndefined(ctx.inputAppearance))
        ctx.inputAppearance = "underline";
    if (isNullOrUndefined(ctx.buttonShape))
        ctx.buttonShape = "circular";
    return ctx;
}