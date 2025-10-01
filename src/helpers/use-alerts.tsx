import { Label } from "@fluentui/react-components";
import { isFunction, isString } from "@kwiz/common";
import { useCallback } from "react";
import { IPrompterProps, Prompter } from "../controls/prompt";
import { useEffectOnlyOnMount, useStateEX } from "./hooks";

export interface iAlerts {
    promptEX: (info: IPrompterProps) => void;
    confirmEX: (message: string | JSX.Element, onOK?: () => void, onCancel?: () => void) => Promise<boolean>;
    alertEX: (message: string | JSX.Element, onOK?: () => void) => Promise<void>;
    alertPrompt?: JSX.Element;
    close: () => void;
}

/** set block message if you want to block nav.
 * - call setMessage to  add a blocker message
 * - call onNav when you have internal navigation (open / close popups)
 * - render the navPrompt control to your page
 * FYI for page unload, most modern browsers won't show your message but a generic one instead. */
export function useAlerts(): iAlerts {
    const [_prompt, _setPrompt] = useStateEX<IPrompterProps>(null);

    const promptEX = useCallback((info: IPrompterProps) => {
        //need to release react to re-render the prompt
        window.setTimeout(() => {
            //prompt, if ok - clear messages and nav.
            _setPrompt({
                ...info,
                onCancel: () => {
                    _setPrompt(null);
                    if (isFunction(info.onCancel)) info.onCancel();
                },
                onOK: async () => {
                    let closeDialog = true;

                    if (isFunction(info.onOK)) {
                        closeDialog = (await info.onOK()) === false ? false : true;
                    }

                    if (closeDialog)
                        _setPrompt(null);
                }
            });
        }, 1);
    }, useEffectOnlyOnMount);

    const confirmEX = useCallback((message: string | JSX.Element, onOK?: () => void, onCancel?: () => void) => {
        return new Promise<boolean>(resolve => {
            promptEX({
                children: isString(message) ? <Label>{message}</Label> : message,
                onCancel: () => {
                    if (isFunction(onCancel)) onCancel();
                    resolve(false);
                },
                onOK: () => {
                    if (isFunction(onOK)) onOK();
                    resolve(true);
                }
            });
        });
    }, useEffectOnlyOnMount);

    const alertEX = useCallback((message: string | JSX.Element, onOK: () => void) => {
        return new Promise<void>(resolve => {
            promptEX({
                children: isString(message) ? <Label>{message}</Label> : message,
                hideCancel: true,
                onOK: () => {
                    if (isFunction(onOK)) onOK();
                    resolve();
                }
            });
        });
    }, useEffectOnlyOnMount);

    return {
        promptEX, confirmEX, alertEX,
        alertPrompt: _prompt ? <Prompter {..._prompt} /> : undefined,
        close: () => _setPrompt(null)
    };
}