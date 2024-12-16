import { isNullOrUndefined } from "@kwiz/common";
import React from "react";
import { KWIZFluentContext } from "./context-const";

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