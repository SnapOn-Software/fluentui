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

    patchResize();

    ctx.isRtl = ctx.isRtl || ctx.strings?.dir?.() === "rtl";
    return ctx;
}


function patchResize() {
    if (!window.ResizeObserver["sos-patch"]) {
        window.ResizeObserver["sos-patch"] = true;
        const OriginalResizeObserver = window.ResizeObserver;

        window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
            constructor(callback: ResizeObserverCallback) {
                super((entries, observer) => {
                    window.requestAnimationFrame(() => {
                        callback(entries, observer);
                    });
                });
            }
        };
    }
}