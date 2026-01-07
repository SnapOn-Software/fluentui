import { makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
    highlighted: {
        transition: 'text-shadow 0.3s ease-in-out'
    },
    highlight: {
        textShadow:
            `0 0 10px ${tokens.colorStatusSuccessBorderActive},
            0 0 20px ${tokens.colorStatusSuccessBorderActive},
            0 0 30px ${tokens.colorStatusSuccessBorderActive},
            0 0 40px ${tokens.colorStatusSuccessBorderActive}`
    },
    highlightWarn: {
        textShadow:
            `0 0 10px ${tokens.colorStatusWarningBorderActive},
            0 0 20px ${tokens.colorStatusWarningBorderActive},
            0 0 30px ${tokens.colorStatusWarningBorderActive},
            0 0 40px ${tokens.colorStatusWarningBorderActive}`
    },
    highlightedBox: {
        transition: 'box-shadow 0.3s ease-in-out'
    },
    highlightBox: {
        boxShadow:
            `0 0 10px ${tokens.colorStatusSuccessBorderActive},
            0 0 40px ${tokens.colorStatusSuccessBorderActive}`
    },
    highlightBoxWarn: {
        boxShadow:
            `0 0 10px ${tokens.colorStatusWarningBorderActive},
            0 0 40px ${tokens.colorStatusWarningBorderActive}`
    }
});
export function useHighlight(): {
    highlight: (e: HTMLElement, options?: {
        /** highlight text or the box */
        type: "text" | "box",
        /** delay in (seconds, default: 1) */
        delayIn?: number,
        /** delay out (seconds, default: 2) */
        delayOut?: number,
        /** optional highlight color - default: success */
        intent?: "success" | "warn";
    }) => void;
} {
    const css = useStyles();

    return {
        highlight: (elm, o) => {
            if (elm && elm.classList) {
                const mainClass = (o?.type === "box"
                    ? o?.intent === "warn" ? css.highlightBoxWarn : css.highlightBox
                    : o?.intent === "warn" ? css.highlightWarn : css.highlight).split(' ');
                const animClass = (o?.type === "box" ? css.highlightedBox : css.highlighted).split(' ');

                elm.classList.add(...animClass);//enable animations

                window.setTimeout(() => {
                    elm?.classList.add(...mainClass)
                }, o?.delayIn > 0 ? o.delayIn * 1000 : 1000);
                window.setTimeout(() => {
                    elm?.classList.remove(...mainClass)
                }, o?.delayOut > 0 ? o.delayOut * 1000 : 2000);
            }
        }
    }
}