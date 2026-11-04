import type { FluentIcon, FluentIconsProps } from "@fluentui/react-icons";
import { useEffect, useState } from "react";

// exported privately, not for package consumers (not in index file) so feel free to make breaking changes
// if this changes - remove this comment!

type iconsModule = Record<string, FluentIcon | undefined>;
interface iconEntry { base: string; stem: string; variantRank: number; sized: boolean; name: string; }
interface iconIndex { icons: iconsModule; entries: iconEntry[]; }
let iconsPromise: Promise<iconIndex> | undefined;

const variants = ["regular", "filled", "color"];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/** loads the icons package only once, and only when an icon is actually needed */
function loadIcons() {
    iconsPromise ??= import("@fluentui/react-icons").then(m => {
        const icons = m as unknown as iconsModule;
        const entries: iconEntry[] = [];
        Object.keys(icons).forEach(name => {
            const match = /^([A-Z][A-Za-z]*?)(\d*)(Regular|Filled|Color)$/.exec(name);
            if (match)
                entries.push({ base: match[1], stem: normalize(match[1]), sized: match[2] !== "", variantRank: variants.indexOf(match[3].toLowerCase()), name });
        });
        return { icons, entries };
    });
    return iconsPromise;
}

/** best match for a name like "search", "Search" or "SearchFilled". prefers exact names, then the regular variant, then unsized icons */
function findBestIcon({ icons, entries }: iconIndex, name: string): FluentIcon | undefined {
    const exact = icons[`${name}Regular`] ?? icons[name];
    if (exact) return exact;
    const query = normalize(name);
    const requested = variants.find(v => query.endsWith(v));
    const base = requested ? query.slice(0, -requested.length) : query;
    if (!base) return undefined;

    let best: iconEntry | undefined;
    let bestScore = Infinity;
    for (const entry of entries) {
        let score: number;
        if (entry.stem === base) score = 0;
        else if (entry.stem.startsWith(base)) score = 10 + (entry.stem.length - base.length) / 100;
        else if (entry.stem.includes(base)) score = 20 + (entry.stem.length - base.length) / 100;
        else continue;

        const variant = requested ? (variants[entry.variantRank] === requested ? 0 : 1 + entry.variantRank) : entry.variantRank;
        score += variant + (entry.sized ? 0.5 : 0);
        if (score < bestScore) {
            bestScore = score;
            best = entry;
        }
    }
    return best ? icons[best.name] : undefined;
}

/** renders a FluentUI 9 icon by best match to a name, e.g. Search finds SearchRegular. renders nothing if nothing matches */
export function useFluentIcon(name?: string): FluentIcon | undefined {
    const [icon, setIcon] = useState<FluentIcon>();

    useEffect(() => {
        let cancelled = false;
        setIcon(undefined);
        if (name)
            loadIcons().then(index => {
                const found = findBestIcon(index, name);
                if (!cancelled && found)
                    setIcon(() => found);
            });
        return () => { cancelled = true; };
    }, [name]);

    return icon;
}

/** all available icon names, without size or variant suffix, e.g. Search. Empty until the icons package is loaded */
export function useFluentIconsList(): { name: string; title: string; }[] {
    const [names, setNames] = useState<{ name: string; title: string; }[]>([]);

    useEffect(() => {
        let cancelled = false;
        loadIcons().then(({ entries }) => {
            if (!cancelled)
                setNames(Array.from(new Set(entries.map(e => e.base))).sort().map(name => ({
                    name,
                    title: name.replace(/(?<!^)([A-Z])/g, " $1")
                })));
        });
        return () => { cancelled = true; };
    }, []);

    return names;
}