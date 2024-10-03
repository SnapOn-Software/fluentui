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
        zIndex: 2, //SUSPECTED NOT RELEVANT ANYMORE - can't go over 1, so it won't hide code editor menu if code editor is added below this
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

export const useCommonStyles = makeStyles({
    printShow: {
        display: 'none',
        ':global(body.print-root)': {
            display: 'unset',
        },
        '@media print': {
            display: 'unset',
        }
    },
    printHide: {
        ':global(body.print-root)': {
            display: 'none !important'
        },
        '@media print': {
            display: 'none !important'
        }
    },
})

export const widthMedium = 360;
//export const widthWide = 520;
