"use client"
import { deleteCookie, forEach, getCookie, getGlobal, IDictionary, isNullOrUndefined, setCookie } from "@kwiz/common";
import { useEffect, useId, useState } from "react";

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
    g_update_handlers: IDictionary<(theme: iThemeInfo) => void>;
} = getGlobal("g_theme", {
    theme: getThemeInfo(),
    g_update_handlers: {}
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
    forEach(globals.g_update_handlers, (name, value) => value(globals.theme));
}

export function useTheme() {
    const [theme, setTheme] = useState(globals.theme);
    const id = useId();
    useEffect(() => {
        globals.g_update_handlers[id] = (newTheme) => { setTheme(newTheme); };
        return () => {
            delete globals.g_update_handlers[id];
        };
    }, [id]);
    return theme;
}