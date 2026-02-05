import { buttonClassNames, GriffelStyle, makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { filterEmptyEntries, isNotEmptyArray, isNotEmptyString } from "@kwiz/common";

export const KnownClassNames = {
    print: 'print-root',
    printHide: 'print-hide',
    printShow: 'print-show',
    section: 'kfui-section',
    vertical: 'kfui-vertical',
    horizontal: 'kfui-horizontal',
    list: 'kfui-list',
    accordion: 'kfui-accordion',
    accordionHeader: 'kfui-accordion-header',
    accordionBody: 'kfui-accordion-body',
    accordionBodyWrapper: 'kfui-accordion-body-wrapper',
    isOpen: 'is-opened',
    progressBarStepLabel: 'kfui-step-label',
    left: 'float-left',
    right: 'float-right',
    cardList: 'kfui-card-list',
    tagSelected: 'kfui-tag-selected',
    tagUnselected: 'kfui-tag-unselected',
    tagNoSelection: 'kfui-tag-no-selection'
}

export namespace mixins {
    export const main: GriffelStyle = {
        flexShrink: 1,
        flexGrow: 1
    };
    export const clickable: GriffelStyle = {
        cursor: "pointer",
        ['& label']: {
            cursor: "pointer"
        }
    }
    export const box: GriffelStyle = {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        boxShadow: tokens.shadow4,
        margin: tokens.spacingHorizontalXXS
    }
    export const float: GriffelStyle = {
        ...box,
        /** make buttons work */
        position: "relative",
        /** make buttons work */
        maxWidth: "33%",
        /** stop bleeding into page */
        overflowX: "hidden",

        ['& img']: {
            maxWidth: "100%"
        }
    }

    export const flex: GriffelStyle = {
        display: 'flex',
        flexWrap: 'nowrap',
        rowGap: tokens.spacingVerticalM,
        columnGap: tokens.spacingVerticalM,
    }

    export const wrap: GriffelStyle = {
        flexWrap: "wrap",
        //for some reason priority here is not right
        [`&.${KnownClassNames.horizontal},&.${KnownClassNames.vertical}`]: {
            flexWrap: "wrap"
        }
    }
    export const nogap: GriffelStyle = {
        rowGap: 0,
        columnGap: 0
    }
    export const ellipsis: GriffelStyle = {
        whiteSpace: 'nowrap',
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
}

export const useCommonStyles = makeStyles({
    hintLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightRegular,
        lineHeight: tokens.lineHeightBase200
    },
    validationLabel: {
        color: tokens.colorPaletteRedForeground1,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightRegular,
        lineHeight: tokens.lineHeightBase200
    },
    fullscreen: {
        position: "fixed",
        top: 0, bottom: 0, left: 0, right: 0,
        zIndex: 1,
        backgroundColor: tokens.colorNeutralBackground1,
        overflow: "auto",
        padding: tokens.spacingHorizontalL,
        paddingLeft: "20px",
        paddingRight: "20px"
    },
    header: {
        boxShadow: tokens.shadow4Brand,
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorBrandBackgroundInverted,
        padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
        [`& .${KnownClassNames.tagSelected} button`]: {
            backgroundColor: tokens.colorBrandBackgroundSelected
        },
        [`& .${KnownClassNames.tagNoSelection} button`]: {
            backgroundColor: tokens.colorBrandBackgroundInvertedSelected,
            color: tokens.colorNeutralForeground1
        },
        [`& button, & button:hover, & a, & a:hover, & button:hover .${buttonClassNames.icon}`]: {
            color: tokens.colorBrandBackgroundInverted
        },
        '& button:hover': {
            backgroundColor: tokens.colorBrandBackgroundHover
        },
    }
});

export const commonSizes = {
    /** 360 */
    widthMedium: 360,
    /** 520 */
    widthWide: 520,
    /** 820 */
    extraWidthWide: 820,
}

/** calls mergeClasses handle string[] that might have multi class (split by space) elements */
export function mergeClassesEX(...css: (string | string[])[]) {
    const combined = filterEmptyEntries((css || []).flatMap(c =>
        isNotEmptyArray(c)
            ? c.flatMap(c2 => isNotEmptyString(c2)
                ? c2.split(" ") : [])
            : isNotEmptyString(c)
                ? c.split(" ")
                : []));

    return mergeClasses(...combined);
}