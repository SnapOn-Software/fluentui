import { ButtonProps } from "@fluentui/react-components";
import { isFunction, isNotEmptyArray, isNullOrEmptyString } from '@kwiz/common';
import * as React from "react";
import { ButtonEX, CompoundButtonEXSecondary } from "./button";

interface iProps {
    showTitleWithIcon?: boolean;
    title?: string;
    /** Passing this will turn the button into a compound button */
    secondaryContent?: string;
    limitFileTypes?: string[];
    allowMultiple?: boolean;
    icon?: JSX.Element;
    onChange?: (newFile: File | FileList) => void;
    /** only works for single file, reads it as base64 */
    asBase64?: (base64: string) => void;
    buttonProps?: ButtonProps;
    disabled?: boolean;
}

export const FileUpload = React.forwardRef<HTMLButtonElement, (iProps)>((props, ref) => {
    const hiddenFileInput = React.useRef(null);
    const isMulti = props.allowMultiple === true;
    return <>
        {isNullOrEmptyString(props.secondaryContent)
            ? <ButtonEX ref={ref} {...(props.buttonProps || {})} icon={props.icon} showTitleWithIcon={props.showTitleWithIcon} onClick={() => {
                hiddenFileInput.current.value = "";
                hiddenFileInput.current.click();
            }} title={props.title}
                disabled={props.disabled}
            />
            : <CompoundButtonEXSecondary ref={ref} {...(props.buttonProps || {})} icon={props.icon}
                secondaryContent={props.secondaryContent}
                onClick={() => {
                    hiddenFileInput.current.value = "";
                    hiddenFileInput.current.click();
                }} title={props.title}
                disabled={props.disabled}
            />}
        <input type="file" ref={hiddenFileInput} style={{ display: "none" }} multiple={isMulti}
            accept={isNotEmptyArray(props.limitFileTypes) ? props.limitFileTypes.map(ft => `.${ft}`).join() : undefined}
            onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                    if (isMulti) {
                        if (isFunction(props.onChange)) {
                            props.onChange(e.target.files);
                        }
                    }
                    else {
                        const fileUploaded = e.target.files && e.target.files[0];
                        if (isFunction(props.onChange)) {
                            props.onChange(fileUploaded);
                        }
                        if (isFunction(props.asBase64) && fileUploaded) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                console.log(reader.result);
                                if (!isNullOrEmptyString(reader.result))
                                    props.asBase64(reader.result as string);
                            };
                            reader.readAsDataURL(fileUploaded);
                        }
                    }
                }
            }}
        />
    </>;
});