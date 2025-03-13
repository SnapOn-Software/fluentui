import { Toast, ToastTitle, Toaster, useId, useToastController } from "@fluentui/react-components";
import { useCallback, useState } from "react";
import { PleaseWait } from "../controls/please-wait";
import { useEffectOnlyOnMount, useStateEX } from "./hooks";

/* Provides useful helpers for tracking if control has changes, and handling the save changes with progress bar and on success/fail messages. */
export function useEditableControl() {
    const [showProgress, setShowProgress] = useState(false);
    const [hasChanges, setHasChanges, hasChangesRef] = useStateEX(false, { skipUpdateIfSame: true });

    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const onSaveChanges = useCallback(async (worker: () => Promise<{ success: boolean; message: string; }>) => {
        setShowProgress(true);
        const success = await worker();
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

    return {
        hasChanges, hasChangesRef, setHasChanges, onSaveChanges, editablePageElement: <>
            {showProgress && <PleaseWait />}
            <Toaster toasterId={toasterId} />
        </>
    };
}