import React from "react";
export type iKWIZFluentStringValueType = (options?: { cap?: boolean; param?: string | number | Date; }) => string;
export interface iKWIZFluentContext {
    /**
     * Where the portal children are mounted on DOM
     *
     * @default a new element on document.body without any styling
     */
    mountNode?: HTMLElement | null | {
        element?: HTMLElement | null;
        className?: string;
    }
    /**
     * Controls the colors and borders of the input.
     * 
     * @default 'underline'
     */
    inputAppearance?: 'outline' | 'underline' | 'filled-darker' | 'filled-lighter';

    /**
     * A button can be rounded, circular, or square.
     *
     * @default 'rounded'
     */
    buttonShape?: 'rounded' | 'circular' | 'square';
    /** true if using dark theme */
    dark?: boolean;
    strings?: {
        btn_ok?: iKWIZFluentStringValueType;
        btn_cancel?: iKWIZFluentStringValueType;
        btn_close?: iKWIZFluentStringValueType;
        btn_clear?: iKWIZFluentStringValueType;
        btn_open_param?: iKWIZFluentStringValueType;
        gallery?: iKWIZFluentStringValueType;
        more?: iKWIZFluentStringValueType;
        color_picker?: iKWIZFluentStringValueType;
        choose_color?: iKWIZFluentStringValueType;
        placeholder_input?: iKWIZFluentStringValueType;
        drop_or_select_file?: iKWIZFluentStringValueType;
        drop_or_select_files?: iKWIZFluentStringValueType;
        more_param?: iKWIZFluentStringValueType;
        items?: iKWIZFluentStringValueType;
        direction?: iKWIZFluentStringValueType;
        prompt_wait?: iKWIZFluentStringValueType;
    }
}

//create context
export const KWIZFluentContext = React.createContext<iKWIZFluentContext>(null);