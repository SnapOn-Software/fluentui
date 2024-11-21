import { GriffelStyle, makeStyles, tokens } from "@fluentui/react-components";

export module mixins {
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
    const box: GriffelStyle = {
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
        flexWrap: "wrap"
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

    // export const box: GriffelStyle = {
    // }
}

export const KnownClassNames = {
    print: 'print-root',
    section: 'kfui-section',
    vertical: 'kfui-vertical',
    horizontal: 'kfui-horizontal',
    list: 'kfui-list',
    accordion: 'kfui-accordion',
    accordionHeader: 'kfui-accordion-header',
    accordionBody: 'kfui-accordion-body',
    accordionBodyWrapper: 'kfui-accordion-body-wrapper',
    accordionBodyIndent: 'kfui-accordion-indent',
    isOpen: 'is-opened',
}
export const useCommonStyles = makeStyles({
    printShow: {
        display: 'none',
        [`:global(body.${KnownClassNames.print})`]: {
            display: 'unset',
        },
        '@media print': {
            display: 'unset',
        }
    },
    printHide: {
        [`:global(body.${KnownClassNames.print})`]: {
            display: 'none !important'
        },
        '@media print': {
            display: 'none !important'
        }
    },
})

export const commonSizes = {
    widthMedium: 360,
    widthWide: 520,
    extraWidthWide: 820,
}