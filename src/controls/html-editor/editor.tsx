import { makeStyles, tokens } from '@fluentui/react-components';
import { DismissRegular, SaveRegular } from '@fluentui/react-icons';
import JoditEditor, { Jodit } from "jodit-react";
import React, { useRef } from 'react';
import { IconToSVG } from '../svg';

const useStyles = makeStyles({
    htmlDiv: {
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStrokeAccessible}`,
        padding: tokens.spacingHorizontalS,
        minHeight: `100px`
    }
});

interface IProps {
    value?: string;
    onChange?: (value: string) => void;
    onSave?: (value: string) => void;
    onCancel?: () => void;
    readonly?: boolean;
    css?: string[];
    smallToolbar?: boolean;
    editOnDemand?: boolean;

    /** all designers */
    kitchensink?: boolean;
    speech?: boolean;
    spellcheck?: boolean;
    table?: boolean;
    media?: boolean;
    source?: boolean;

}
export const HtmlEditor: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const classes = useStyles();
    const [active, setActive] = React.useState(false);

    //quill react demos: https://codesandbox.io/examples/package/react-quill
    const editor = useRef<Jodit>(null);

    const extraCondig = {
        uploader: {
            insertImageAsBase64URI: true,
            toolbarStickyOffset: 30,
        },
        autofocus: props.editOnDemand,
    };

    const options = props.kitchensink ? {
        speech: true,
        spellcheck: true,
        table: true,
        media: true,
        source: true,
    } : props

    Jodit.defaultOptions.controls.save = {
        childTemplate: () => IconToSVG(<SaveRegular />),
        exec: () => {
            props.onSave(editor.current.value);
        }
    };
    Jodit.defaultOptions.controls.cancel = {
        childTemplate: () => IconToSVG(<DismissRegular />),
        exec: () => {
            props.onCancel();
        }
    };
    return (props.editOnDemand && !active
        ? <div className={classes.htmlDiv} dangerouslySetInnerHTML={{ __html: props.value || "" }}
            tabIndex={0} onFocus={() => setActive(true)}
            onClick={() => setActive(true)} />
        : <JoditEditor
            ref={editor}
            value={props.value || ""}
            config={{
                ...extraCondig,
                readonly: props.readonly,
                inline: true,
                statusbar: false,
                toolbarButtonSize: props.smallToolbar ? "xsmall" : "middle",
                buttons: `${props.onSave && 'save,'}${props.onCancel && 'cancel,'}${(props.onSave || props.onCancel) && ',|'}bold,italic,underline,strikethrough,|,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,copyformat,brush,eraser,|,${options.media && 'image,video,'}${options.spellcheck && 'spellcheck,'}${options.speech && 'speechRecognize,'}hr,${options.table && 'table,'}link,indent,outdent,${options.source && '---,source,'}`.replace(/undefined/g, ''),
            }}
            onBlur={newContent => {
                if (props.onChange)
                    props.onChange(newContent);
                setActive(false);
            }} // preferred to use only this option to update the content for performance reasons
        //onChange={newContent => {            }}
        />
    );
}
