import { makeStyles, mergeClasses } from "@fluentui/react-components";

/** switch to using a var, reset it to hidden on every scope. this way nested controls will
 * not all show up when parent is on hover.
 */
const useStyles = makeStyles({
    hoverParent: {
        "--kfui-show-on-hover-visibility": "hidden",
        ":hover": {
            "--kfui-show-on-hover-visibility": "visible"
        },
        "& .fui-Tab__content--reserved-space": {
            "--kfui-show-on-hover-visibility": "hidden"
        }
    },
    showOnHover: {
        visibility: "var(--kfui-show-on-hover-visibility, hidden)" as "hidden"
    },
    //only applies while not hovered, so the original border color is restored on hover. width is untouched.
    hideBorders: {
        ":not(:hover)": {
            borderTopColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent"
        }
    }
});

export function useShowOnHover(options?: { hideBorders?: boolean; }) {
    const styles = useStyles();
    return {
        hoverParent: options?.hideBorders ? mergeClasses(styles.hoverParent, styles.hideBorders) : styles.hoverParent,
        showOnHover: styles.showOnHover
    }
}