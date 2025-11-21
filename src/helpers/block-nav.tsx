import { IDictionary, isNotEmptyArray, isNullOrEmptyString, jsonClone, objectsEqual } from "@kwiz/common";
import { useCallback, useEffect } from "react";
import { IPrompterProps, Prompter } from "../controls/prompt";
import { useEffectOnlyOnMount, useStateEX } from "./hooks";

export interface iBlockNav {
    setMessage: (id: string, message?: string) => void;
    onNav: (nav: () => void) => void;
    navPrompt?: JSX.Element;

}
/** set block message if you want to block nav.
 * - call setMessage to  add a blocker message
 * - call onNav when you have internal navigation (open / close popups)
 * - render the navPrompt control to your page
 * FYI for page unload, most modern browsers won't show your message but a generic one instead. */
export function useBlockNav(): iBlockNav {
    const [, setBlockNavMessages, blockNavMessagesRef] = useStateEX<IDictionary<string>>({});
    const [_prompt, setPrompt] = useStateEX<IPrompterProps>(null);

    const getMessagesArr = useCallback(() => {
        return Object.keys(blockNavMessagesRef.current).map(id => blockNavMessagesRef.current[id]);
    }, useEffectOnlyOnMount);

    const getMessages = useCallback(() => {
        return getMessagesArr().join();
    }, useEffectOnlyOnMount);

    const onNav = useCallback((nav: () => void) => {
        let messages = getMessagesArr();
        if (isNotEmptyArray(messages)) {
            //need to release react to re-render the prompt
            window.setTimeout(() => {
                //prompt, if ok - clear messages and nav.
                setPrompt({
                    okButtonText: "Leave",
                    cancelButtonText: "Cancel",
                    title: "Leave page?",
                    children: messages.length > 1
                        ? <ul>
                            {messages.map((m, i) => <li key={`m${i}`}>{m}</li>)}
                        </ul>
                        : <p>{messages[0]}</p>,
                    onCancel: () => setPrompt(null),
                    onOK: () => {
                        setPrompt(null);
                        setBlockNavMessages({});//clear messages
                        nav();
                    }
                });
            }, 1);
        }
        else nav();
    }, useEffectOnlyOnMount);


    useEffect(() => {
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            //todo: use blockMessageRef.current so that we don't have to re-register every time message changes.
            //otherwise we would have to add blockMessage as a dependency for this useEffect
            const message = getMessages();
            if (!isNullOrEmptyString(message)) {
                e.preventDefault();
                e.returnValue = message;
            }
        }
        // Add event listener
        window.addEventListener("beforeunload", handleBeforeUnload);
        // Remove event listener on cleanup
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, useEffectOnlyOnMount);
    return {
        setMessage: (id: string, message?: string) => {
            let current = jsonClone(blockNavMessagesRef.current);
            if (isNullOrEmptyString(message))
                delete current[id];
            else current[id] = message;
            if (!objectsEqual(current, blockNavMessagesRef.current))
                setBlockNavMessages(current);
        },
        // clearMessages: () => {
        //     setBlockNavMessages({});
        // },
        // getMessages,
        // getMessagesArr,


        /** single page applications, call this to navigate if ok */
        onNav,
        navPrompt: _prompt ? <Prompter {..._prompt} /> : undefined
    };
}