"use client"
import { deleteCookie, dispatchCustomEvent, getCookie, getGlobal, isNullOrUndefined, setCookie } from "@kwiz/common";
import { useEffect, useId, useState } from "react";
import { useIsInPrint } from "./hooks-events";

const $themeCookie = "KWTheme";
export type themeScheme = "light" | "dark";
export interface iThemeInfo {
    auto: boolean;
    scheme: themeScheme;
}

function getDefaultThemeInfo(): iThemeInfo {
    const themeInfo: iThemeInfo = { auto: true, scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light" };
    return themeInfo;
}

function getThemeInfo(): iThemeInfo {
    let themeInfo: iThemeInfo = null;
    const cookie = getCookie($themeCookie) as themeScheme;
    if (isNullOrUndefined(cookie)) {
        themeInfo = getDefaultThemeInfo();
    } else {
        themeInfo = { auto: false, scheme: cookie === "dark" ? "dark" : "light" };
    }
    return themeInfo;
}

const globals: {
    theme: iThemeInfo;
} = getGlobal("g_theme", {
    theme: getThemeInfo()
});

export function setThemeInfo(themeInfo: iThemeInfo) {
    const newThemeInfo = (themeInfo.auto && isNullOrUndefined(themeInfo.scheme))
        ? getDefaultThemeInfo()
        : themeInfo;

    if (!themeInfo.auto) {
        setCookie($themeCookie, themeInfo.scheme, 365);
    } else {
        deleteCookie($themeCookie);
    }

    globals.theme = newThemeInfo;
    dispatchCustomEvent(globalThis as any as Window, "OnThemeChanged");
}

export function useTheme(): iThemeInfo {
    const [theme, setTheme] = useState(globals.theme);
    const isInPrint = useIsInPrint();

    const id = useId();
    useEffect(() => {
        const listener = () => { setTheme(globals.theme); };

        window.addEventListener("OnThemeChanged", listener);
        return () => {
            window.removeEventListener("OnThemeChanged", listener);
        };
    }, [id]);

    return isInPrint ? { auto: false, scheme: "light" } : theme;
}