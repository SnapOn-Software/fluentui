import { BrandVariants, Theme, createDarkTheme, createLightTheme, teamsDarkTheme, teamsLightTheme } from "@fluentui/react-components";

export interface iThemeContext {
    teams?: boolean;
    dark?: boolean;
}

export function getTheme(ctx: iThemeContext, t: BrandVariants = kThemeDefault) {
    return ctx.dark
        ? getDarkTheme(ctx, t)
        : getLightTheme(ctx, t);
}


export const kThemeDefault: BrandVariants = {
    10: "#04010A",
    20: "#16103B",
    30: "#17176F",
    40: "#0F1D9A",
    50: "#2F2AA1",
    60: "#4338A8",
    70: "#5546AF",
    80: "#6555B6",
    90: "#7563BD",
    100: "#8472C4",
    110: "#9282CB",
    120: "#A191D2",
    130: "#AFA1D9",
    140: "#BDB1E0",
    150: "#CBC1E7",
    160: "#D9D2EE"
};

export const kThemeOrange: BrandVariants = {
    10: "#040301",
    20: "#1E170A",
    30: "#312610",
    40: "#403112",
    50: "#503D14",
    60: "#604915",
    70: "#705516",
    80: "#816216",
    90: "#926E16",
    100: "#A37B15",
    110: "#B58914",
    120: "#C79612",
    130: "#DAA40E",
    140: "#EDB208",
    150: "#FFC001",
    160: "#FFD47F"
};

export const kThemeSecondary: BrandVariants = {
    10: "#020304",
    20: "#101A1D",
    30: "#162B32",
    40: "#1A3742",
    50: "#1D4552",
    60: "#1F5363",
    70: "#216175",
    80: "#227087",
    90: "#227F9A",
    100: "#208EAD",
    110: "#1E9EC0",
    120: "#1AADD4",
    130: "#12BEE8",
    140: "#02CEFD",
    150: "#6BDAFF",
    160: "#A0E5FF"
};

function getLightTheme(ctx: iThemeContext, t: BrandVariants = kThemeDefault) {
    if (ctx.teams) return teamsLightTheme;
    //return jsonClone(webLightTheme);
    const lightTheme: Theme = {
        ...createLightTheme(t),
    };
    return lightTheme;
}

function getDarkTheme(ctx: iThemeContext, t: BrandVariants = kThemeDefault) {
    if (ctx.teams) return teamsDarkTheme;
    //return jsonClone(webDarkTheme);
    const darkTheme: Theme = {
        ...createDarkTheme(t),
    };

    darkTheme.colorBrandForeground1 = t[110];
    darkTheme.colorBrandForeground2 = t[120];
    return darkTheme;
}