import { makeStyles } from "@fluentui/react-components";

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
    }
});

export function useShowOnHover() {
    const styles = useStyles();
    return { hoverParent: styles.hoverParent, showOnHover: styles.showOnHover }
}