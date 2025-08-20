import { Link, Toast, ToastBody, Toaster, ToastFooter, ToastIntent, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { isNotEmptyArray } from "@kwiz/common";
import { useKWIZFluentContext } from "./context-internal";

export type toastDispatcher = (info: {
    title?: string;
    body?: string;
    subtitle?: string;
    titleAction?: { text: string, onClick: () => void },
    footerActions?: { text: string, onClick: () => void }[],
    intent?: ToastIntent
}) => void;
export function useToast(): {
    control: JSX.Element;
    dispatch: toastDispatcher;
} {
    const ctx = useKWIZFluentContext();
    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);
    return {
        control: <Toaster mountNode={ctx.mountNode} toasterId={toasterId} />,
        dispatch: info => {
            dispatchToast(<Toast>
                {info.title && <ToastTitle action={info.titleAction ? <Link onClick={info.titleAction.onClick}>{info.titleAction.text}</Link> : undefined}>{info.title}</ToastTitle>}
                {info.body && <ToastBody subtitle={info.subtitle}>{info.body}</ToastBody>}
                {isNotEmptyArray(info.footerActions) &&
                    <ToastFooter>
                        {info.footerActions.map((a, i) => <Link key={`l${i}`} onClick={a.onClick}>{a.text}</Link>)}
                    </ToastFooter>
                }
            </Toast>, { intent: info.intent || "info" });
        }
    }
}