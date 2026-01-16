import { Link, Spinner, Toast, ToastBody, Toaster, ToastFooter, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { isNotEmptyArray } from "@kwiz/common";
import { useKWIZFluentContext } from "./context-internal";

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

}) => void;
export function useToast(): {
    control: JSX.Element;
    dispatch: toastDispatcherType;
} {
    const ctx = useKWIZFluentContext();
    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);
    return {
        control: <Toaster mountNode={ctx.mountNode} toasterId={toasterId} />,
        dispatch: info => {
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
                intent:
                    info.intent === "progress"
                        ? "info"
                        : info.intent || "info"
            });
        }
    }
}