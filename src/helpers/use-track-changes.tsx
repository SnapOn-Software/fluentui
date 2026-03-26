import { Toast, Toaster, ToastTitle, useId, useToastController } from "@fluentui/react-components";
import { GetError, isBoolean } from "@kwiz/common";
import { MutableRefObject, useCallback, useMemo, useState } from "react";
import { iPleaseWaitProps, PleaseWait } from "../controls/please-wait";
import { useBlockNav } from "./block-nav";
import { useKWIZFluentContext } from "./context-internal";
import { useEffectOnlyOnMount, useStateEX } from "./hooks";
import { useAlerts } from "./use-alerts";

export interface iTrackChanges {
    hasChanges: boolean;
    hasChangesRef: MutableRefObject<boolean>;
    setHasChanges: (newValue: boolean) => Promise<boolean>;
    onSaveChanges: (worker: () => Promise<{
        success: boolean;
        message?: string;
    }>, props?: { waitProps?: iPleaseWaitProps; }) => Promise<void>;
    /** if there are changes, prompt the user. otherwise just call handler. */
    doIfNoChanges: <ReturnType>(handler: () => ReturnType) => ReturnType;
}

/* Provides useful helpers for tracking if control has changes, and handling the save changes with progress bar and on success/fail messages. */
export function useTrackChanges({ blockNav }: { blockNav?: boolean; } = {}): {
    trackChanges: iTrackChanges,
    /** include in your react control */
    trackChangesElement: JSX.Element,
} {

    const ctx = useKWIZFluentContext();

    const unsavedChangesPrompt = useMemo(() => ctx.strings?.prompt_unsaved_changes?.() || "You will lose unsaved changes. Continue?", [ctx.strings]);
    const alerts = useAlerts();
    const [showProgress, setShowProgress] = useState<boolean | iPleaseWaitProps>(false);
    //we just need it to register the window unload event... no need for its element or onNav we handle it in this element.
    const navBlockData = useBlockNav();
    const [hasChanges, setHasChanges, hasChangesRef] = useStateEX(false, {
        name: "hasChanges", skipUpdateIfSame: true, onChange: (newValue, isValueChanged) => {
            if (isValueChanged)
                navBlockData.setMessage("useTrackChanges", (blockNav && newValue === true) ? unsavedChangesPrompt : undefined);
            return newValue;
        }
    });

    const toasterId = useId("toaster");
    const { dispatchToast } = useToastController(toasterId);

    const onSaveChanges: iTrackChanges["onSaveChanges"] = useCallback(async (worker, props) => {
        setShowProgress(props?.waitProps || true);
        let success: { success: boolean; message?: string; };
        try {
            success = await worker();
        } catch (e) {
            success = { success: false, message: `Something went wrong: ${GetError(e)}` };
        }
        setShowProgress(false);

        if (success.success !== true) {
            dispatchToast(<Toast>
                <ToastTitle>{success.message || ctx.strings?.error_cannot_save_changes?.({ cap: true }) || "Could not save your changes."}</ToastTitle>
            </Toast>, { intent: "warning", timeout: 10000 });
        }
        else {
            setHasChanges(false);
            //todo: trasnlate
            dispatchToast(<Toast>
                <ToastTitle>{success.message || "Changes saved!"}</ToastTitle>
            </Toast>, { intent: "success", timeout: 2000 });
        }
    }, useEffectOnlyOnMount);

    const doIfNoChanges = useCallback(<ReturnType,>(handler: () => ReturnType, prompt?: string) => {
        if (hasChanges)
            alerts.confirmEX(prompt || unsavedChangesPrompt, { okProps: { variant: "danger" } }).then(result => {
                if (result) {
                    setHasChanges(false);
                    return handler();
                }
            });
        else return handler();
    }, [hasChanges, alerts]);

    const trackChanges = useMemo<iTrackChanges>(() => ({
        hasChanges,
        hasChangesRef,
        setHasChanges,
        onSaveChanges,
        doIfNoChanges
    }), [hasChanges, hasChangesRef, setHasChanges, onSaveChanges, doIfNoChanges]);
    const trackChangesElement = useMemo(() => (
        <>
            {alerts.alertPrompt}
            {showProgress && <PleaseWait {...(isBoolean(showProgress) ? {} : showProgress)} />}
            <Toaster toasterId={toasterId} />
        </>
    ), [alerts.alertPrompt, showProgress, toasterId]);

    return useMemo(() => ({
        trackChanges,
        trackChangesElement
    }), [trackChanges, trackChangesElement]);
}

/** @deprecated renamed to useTrackChanges */
export function useEditableControl() {
    const { trackChanges, trackChangesElement } = useTrackChanges();
    return { ...trackChanges, editablePageElement: trackChangesElement };
}