import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { ArrowUploadRegular } from "@fluentui/react-icons";
import { isFunction, isNotEmptyArray, isNotEmptyString, isNullOrEmptyString, lastOrNull } from '@kwiz/common';
import * as React from "react";
import { dropFiles, useDragDropContext, useEffectOnlyOnMount } from "../helpers";
import { useKWIZFluentContext } from "../helpers/context-internal";
import { ButtonEXProps } from "../types";
import { ButtonEX, CompoundButtonEXSecondary } from "./button";

const useStyles = makeStyles({
    addRowIsOver: {
        ...shorthands.borderColor(tokens.colorBrandBackground)
    }
});

type base64Result = { base64: string, filename: string };
interface iProps {
    showTitleWithIcon?: boolean;
    title?: string;
    /** Passing this will turn the button into a compound button */
    secondaryContent?: string;
    limitFileTypes?: string[];
    allowMultiple?: boolean;
    icon?: JSX.Element;
    onChange?: (newFile: File | File[], errors: string[]) => void;
    asBase64?: (files: base64Result[], errors: string[]) => void;
    buttonProps?: Partial<ButtonEXProps>;
    disabled?: boolean;
    /** limit file size in MB, for the asBase64 */
    fileSizeLimit?: number;
}

export const FileUpload = React.forwardRef<HTMLButtonElement, (iProps)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    const classes = useStyles();
    const hiddenFileInput = React.useRef(null);
    const onChangeRef = React.useRef(props.onChange);
    const asBase64Ref = React.useRef(props.asBase64);

    const isMulti = props.allowMultiple === true;
    const icon = props.icon || <ArrowUploadRegular />;
    let title = isNotEmptyString(props.title)
        ? props.title
        : (
            isMulti ? ctx.strings?.drop_or_select_files?.({ cap: true }) : ctx.strings?.drop_or_select_file?.({ cap: true })
        ) || `Drop or select ${isMulti ? 'files' : 'file'}`;

    //keep onChange up to date
    React.useEffect(() => {
        onChangeRef.current = props.onChange;
    }, [props.onChange]);
    //keep onChange up to date
    React.useEffect(() => {
        asBase64Ref.current = props.asBase64;
    }, [props.asBase64]);


    const onGotFiles = React.useCallback(async (rawFiles: FileList) => {
        let errors: string[] = [];
        let acceptedFiles: File[] = [];
        if (rawFiles && rawFiles.length > 0) {
            //filter by types and size
            for (let i = 0; i < (isMulti ? rawFiles.length : 1); i++) {
                const currentFile = rawFiles[i];
                let hadError = false;
                if (props.fileSizeLimit > 0) {
                    const megabytes = currentFile.size / (1024 * 1024);
                    if (megabytes > props.fileSizeLimit) {
                        errors.push(`File ${currentFile.name} is over the size limit`);
                        hadError = true;
                    }
                }
                if (!hadError) {
                    if (isNotEmptyArray(props.limitFileTypes)) {
                        let fileType = lastOrNull(currentFile.name.split('.')).toLowerCase();
                        if (props.limitFileTypes.indexOf(fileType) < 0) {
                            errors.push(`File ${currentFile.name} is not allowed`);
                            hadError = true;
                        }
                    }
                }
                if (!hadError) acceptedFiles.push(currentFile);
            }
        }

        if (isMulti) {
            onChangeRef.current?.(acceptedFiles, errors);
        }
        else {
            const fileUploaded = acceptedFiles[0];
            onChangeRef.current?.(fileUploaded, errors);
        }

        if (isFunction(asBase64Ref.current)) {
            const filesAs64: base64Result[] = [];
            for (let i = 0; i < (isMulti ? acceptedFiles.length : 1); i++) {
                const currentFile = acceptedFiles[i];
                let hadError = false;
                if (props.fileSizeLimit > 0) {
                    const megabytes = currentFile.size / (1024 * 1024);
                    if (megabytes > props.fileSizeLimit) {
                        errors.push(`File ${currentFile.name} is over the size limit`);
                        hadError = true;
                    }
                }
                if (!hadError) {
                    let as64 = await getFileAsBase64(acceptedFiles[i]);
                    if (as64) filesAs64.push(as64);
                    else errors.push(`Could not read file ${acceptedFiles[i].name}`);
                }
            }
            asBase64Ref.current?.(filesAs64, errors);
        }
    }, useEffectOnlyOnMount);

    const dropContext = useDragDropContext<never, dropFiles>({
        dropInfo: {
            acceptTypes: ["__NATIVE_FILE__"],
            onItemDrop: item => {
                onGotFiles(item.files);
            }
        }
    });

    return <>
        {isNullOrEmptyString(props.secondaryContent)
            ? <ButtonEX ref={ref || dropContext.dragDropRef} {...(props.buttonProps || {})} icon={icon} showTitleWithIcon={props.showTitleWithIcon} onClick={() => {
                hiddenFileInput.current.value = "";
                hiddenFileInput.current.click();
            }}
                title={title} disabled={props.disabled}
                className={dropContext.drop.isOver && classes.addRowIsOver}
            />
            : <CompoundButtonEXSecondary ref={ref || dropContext.dragDropRef} {...(props.buttonProps || {})} icon={icon}
                secondaryContent={props.secondaryContent}
                onClick={() => {
                    hiddenFileInput.current.value = "";
                    hiddenFileInput.current.click();
                }}
                title={title} disabled={props.disabled}
                className={dropContext.drop.isOver && classes.addRowIsOver}
            />}
        <input type="file" ref={hiddenFileInput} style={{ display: "none" }} multiple={isMulti}
            accept={isNotEmptyArray(props.limitFileTypes) ? props.limitFileTypes.map(ft => `.${ft}`).join() : undefined}
            onChange={async (e) => onGotFiles(e.target.files)}
        />
    </>;
});

async function getFileAsBase64(file: File): Promise<base64Result> {
    return new Promise<base64Result>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!isNullOrEmptyString(reader.result))
                resolve({ filename: file.name, base64: reader.result as string });
            else {
                console.warn("Empty file selected");
                resolve(null);
            }
        };
        reader.readAsDataURL(file);
    });
}