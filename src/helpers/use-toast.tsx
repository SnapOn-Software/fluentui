import { Link, Spinner, Toast, ToastBody, Toaster, ToastFooter, ToastId, ToastIntent, ToastPoliteness, ToastPosition, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { isNotEmptyArray } from "@kwiz/common";
import { useKWIZFluentContext } from "./context-internal";


export type toastOptionsType = {
    /**
 * Uniquely identifies a toast, used for update and dismiss operations
 */
    toastId: ToastId;
    /**
     * The position the toast should render to
     */
    position?: ToastPosition;
    /**
     * Auto dismiss timeout in milliseconds
     * @default 3000
     */
    timeout?: number;
    /**
     * Toast timeout pauses while focus is on another window
     * @default false
     */
    pauseOnWindowBlur?: boolean;
    /**
     * Toast timeout pauses while user cursor is on the toast
     * @default false
     */
    pauseOnHover?: boolean;
    /**
     * Higher priority toasts will be rendered before lower priority toasts
     */
    priority?: number;
    /**
     * Used to determine [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) narration
     * This will override the intent prop
     */
    politeness?: ToastPoliteness;
}

export type toastDispatcherType = (info: {
    title?: string;
    body?: string;
    /** shows only with body */
    subtitle?: string;
    titleAction?: { text: string, onClick: () => void };
    footerActions?: { text: string, onClick: () => void }[];
    intent?: ToastIntent | "progress";
    media?: JSX.Element;
    inverted?: boolean;
} & Partial<toastOptionsType>) => void;
export function useToast(): {
    control: JSX.Element;
    dispatch: toastDispatcherType;
    dismiss: (toastId: ToastId) => void;
    dismissAll: () => void;
    update: (info: toastOptionsType) => void;
} {
    const ctx = useKWIZFluentContext();
    const toasterId = useId("toaster");
    const { dispatchToast, dismissToast, dismissAllToasts, updateToast } = useToastController(toasterId);
    return {
        control: <Toaster mountNode={ctx.mountNode} toasterId={toasterId} />,
        dispatch: (info) => {
            dispatchToast(<Toast appearance={info.inverted ? "inverted" : undefined}>
                {info.title && <ToastTitle
                    media={info.media
                        ? info.media
                        : info.intent === "progress"
                            ? <Spinner size="tiny" />
                            : undefined}
                    action={info.titleAction ? <Link onClick={info.titleAction.onClick}>{info.titleAction.text}</Link> : undefined}>{info.title}
                </ToastTitle>}
                {info.body && <ToastBody subtitle={info.subtitle}>{info.body}</ToastBody>}
                {isNotEmptyArray(info.footerActions) &&
                    <ToastFooter>
                        {info.footerActions.map((a, i) => <Link key={`l${i}`} onClick={a.onClick}>{a.text}</Link>)}
                    </ToastFooter>
                }
            </Toast>, {
                ...(info || {}),
                intent:
                    info.intent === "progress"
                        ? "info"
                        : info.intent || "info"

            });
        },
        dismiss: dismissToast,
        dismissAll: dismissAllToasts,
        update: info => updateToast(info)
    }
}