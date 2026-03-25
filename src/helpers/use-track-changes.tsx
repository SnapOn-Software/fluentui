import { Toast, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { GetError, isBoolean } from "@kwiz/common";
import { MutableRefObject, useCallback, useState } from "react";
import { iPleaseWaitProps, PleaseWait } from "../controls/please-wait";
import { useEffectOnlyOnMount, useStateEX } from "./hooks";
import { useAlerts } from "./use-alerts";

export interface iTrackChanges {
    hasChanges: boolean;
    hasChangesRef: MutableRefObject<boolean>;
    setHasChanges: (newValue: boolean) => Promise<boolean>;
    onSaveChanges: (worker: () => Promise<{
        success: boolean;
        message?: string;
    }>) => Promise<void>;
    /** if there are changes, prompt the user. otherwise just call handler. */
    doIfNoChanges: <ReturnType>(handler: () => ReturnType) => ReturnType;
}

/* Provides useful helpers for tracking if control has changes, and handling the save changes with progress bar and on success/fail messages. */
export function useTrackChanges(): {
    trackChanges: iTrackChanges,
    /** include in your react control */
    trackChangesElement: JSX.Element
} {
    const alerts = useAlerts();
    const [showProgress, setShowProgress] = useState<boolean | iPleaseWaitProps>(false);
    const [hasChanges, setHasChanges, hasChangesRef] = useStateEX(false, { name: "hasChanges", skipUpdateIfSame: true });

    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const onSaveChanges = useCallback(async (worker: () => Promise<{ success: boolean; message?: string; }>) => {
        setShowProgress(true);
        let success: { success: boolean; message?: string; };
        try {
            success = await worker();
        } catch (e) {
            success = { success: false, message: `Something went wrong: ${GetError(e)}` };
        }
        setShowProgress(false);

        if (success.success !== true) {
            dispatchToast(<Toast>
                <ToastTitle>{success.message || "Could not save your changes."}</ToastTitle>
            </Toast>, { intent: "warning", timeout: 10000 });
        }
        else {
            setHasChanges(false);
            dispatchToast(<Toast>
                <ToastTitle>{success.message || "Changes saved!"}</ToastTitle>
            </Toast>, { intent: "success", timeout: 2000 });
        }
    }, useEffectOnlyOnMount);

    const doIfNoChanges = useCallback(<ReturnType,>(handler: () => ReturnType, prompt?: string) => {
        if (hasChanges)
            alerts.confirmEX(prompt || "You will lose unsaved changes. Continue?", { okProps: { variant: "danger" } }).then(result => {
                if (result) {
                    setHasChanges(false);
                    return handler();
                }
            });
        else return handler();
    }, [hasChanges, alerts]);

    return {
        trackChanges: {
            hasChanges, hasChangesRef, setHasChanges, onSaveChanges, doIfNoChanges
        },
        trackChangesElement: <>
            {alerts.alertPrompt}
            {showProgress && <PleaseWait {...(isBoolean(showProgress) ? {} : showProgress)} />}
            <Toaster toasterId={toasterId} />
        </>
    };
}

/** @deprecated renamed to useTrackChanges */
export function useEditableControl() {
    const { trackChanges, trackChangesElement } = useTrackChanges();
    return { ...trackChanges, editablePageElement: trackChangesElement };
}