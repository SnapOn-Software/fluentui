import { makeStyles } from "@fluentui/react-components";

const showOnHoverClass = "kfui-show-on-hover";
const useStyles = makeStyles({
    hoverParent: {
        [`& .${showOnHoverClass}`]: {
            visibility: "hidden",
        },
        [`:hover .${showOnHoverClass}`]: {
            visibility: "visible"
        },
        //ignore the reserved space rendered element for tab list
        [`:hover .fui-Tab__content--reserved-space .${showOnHoverClass}`]: {
            visibility: "hidden"
        }
    }

});
export function useShowOnHover() {
    return { hoverParent: useStyles().hoverParent, showOnHover: showOnHoverClass }
}