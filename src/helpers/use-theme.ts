"use client"
import { BrandVariants } from "@fluentui/react-components";
import { dispatchCustomEvent, getGlobal, isNotEmptyString, isNullOrUndefined, jsonParse, jsonStringify } from "@kwiz/common";
import { useEffect, useId, useState } from "react";
import { useIsInPrint } from "./hooks-events";

export type themeScheme = "light" | "dark";
export interface iThemeInfo {
    auto: boolean;
    scheme: themeScheme;
    /** if you want to change the theme colors on the fly */
    brandVariants?: BrandVariants;
}

function getDefaultThemeInfo(): iThemeInfo {
    const themeInfo: iThemeInfo = { auto: true, scheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light" };
    return themeInfo;
}

function getThemeInfo(): iThemeInfo {
    let themeInfo: iThemeInfo = getThemeFromLocalStorage();
    if (themeInfo) {
        themeInfo = getDefaultThemeInfo();
    }
    return themeInfo;
}

const globals: {
    theme: iThemeInfo;
} = getGlobal("sos_theme_global", {
    theme: getThemeInfo()
});

export function setThemeInfo(themeInfo: iThemeInfo) {
    const newThemeInfo = (themeInfo.auto && isNullOrUndefined(themeInfo.scheme))
        ? getDefaultThemeInfo()
        : themeInfo;

    if (!themeInfo.auto) {
        saveThemeInLocalStorage(themeInfo);
    } else {
        removeThemeInLocalStorage();
    }

    globals.theme = newThemeInfo;
    dispatchCustomEvent(globalThis as any as Window, "OnThemeChanged");
}

/** returns the theme hook, tells you if to use dark / light and brand variables if they were ever saved.
 * call getTheme({dark:theme.scheme==="dark"}) to get the theme, or if your app wants to use custom colors too
 * call getTheme({dark:theme.scheme==="dark"}, theme.brandVariants) or
 * getTheme({dark:theme.scheme==="dark"}, netSuiteDefault)
 */
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

const $themeStorageKey = "sos-theme-info";
function saveThemeInLocalStorage(themeInfo: iThemeInfo) {
    localStorage.setItem($themeStorageKey, jsonStringify(themeInfo));
}
function getThemeFromLocalStorage(): iThemeInfo {
    const str = localStorage.getItem($themeStorageKey);
    if (isNotEmptyString(str)) return jsonParse(str);
    else return null;
}
function removeThemeInLocalStorage() {
    localStorage.removeItem($themeStorageKey);
}
