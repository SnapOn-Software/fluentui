import { makeStyles, Skeleton, tokens } from '@fluentui/react-components';
import { ArrowMaximize16Regular, ArrowMinimize16Regular, Dismiss16Regular, Save16Regular } from '@fluentui/react-icons';
import { isNullOrUndefined, isObject } from '@kwiz/common';
import JoditEditor, { Jodit } from "jodit-react";
import React, { useEffect, useRef, useState } from 'react';
import { useEffectOnlyOnMount } from '../../helpers';
import { ButtonEX, ButtonEXProps } from '../button';
import { Section } from '../section';
import { IconToSVGAsync } from '../svg';

//const logger = GetLogger("html-editor");

const useStyles = makeStyles({
    htmlDiv: {
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStrokeAccessible}`,
        padding: tokens.spacingHorizontalS,
        minHeight: `100px`
    }
});

interface IProps {
    value?: string;
    /** get notified as soon as user is out of the control */
    onChange?: (value: string) => void;
    /** add a save button and get the value once the user clicks save, close the editor after */
    onSave?: (value: string) => void;
    /** add a cancel button to close this editor */
    onCancel?: () => void;
    readonly?: boolean;
    css?: string[];
    /** render a smaller toolbar */
    smallToolbar?: boolean;
    /** show a div, click on it to render the editor */
    editOnDemand?: boolean;

    /** all designers */
    kitchensink?: boolean;
    speech?: boolean;
    spellcheck?: boolean;
    table?: boolean;
    media?: boolean;
    source?: boolean;
    /**
     * true: render the control in full screen
     * button: render only a button that opens the editor in full screen
     */
    fullScreen?: boolean | ButtonEXProps;
}
type JoditExpanded = Jodit & {//& IViewBased<IViewOptions>
    //value: string;
    kwizInstance: {
        props: IProps,
        setShowFullScreen: (value: boolean) => void;
    }
};

const saveIconPromise = IconToSVGAsync(<Save16Regular title='Save' />);
const cancelIconPromise = IconToSVGAsync(<Dismiss16Regular title='Cancel' />);
const maxIconPromise = IconToSVGAsync(<ArrowMaximize16Regular title='Maximize' />);
const minIconPromise = IconToSVGAsync(<ArrowMinimize16Regular title='Minimize' />);
export const HtmlEditor: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const classes = useStyles();
    const [active, setActive] = React.useState(false);
    const [showFullScreen, setShowFullScreen] = React.useState(false);
    const [icons, setIcons] = useState<{
        saveIcon: string;
        cancelIcon: string;
        maxIcon: string;
        minIcon: string;
    }>(null);

    useEffect(() => {
        Promise.all([saveIconPromise,
            cancelIconPromise,
            maxIconPromise,
            minIconPromise]).then(values => {
                setIcons({
                    saveIcon: values[0],
                    cancelIcon: values[1],
                    maxIcon: values[2],
                    minIcon: values[3]
                });
            });
    }, useEffectOnlyOnMount);

    //quill react demos: https://codesandbox.io/examples/package/react-quill
    const editorRef = useRef<JoditExpanded>(null);

    if (isNullOrUndefined(icons)) return <Skeleton />;

    const { saveIcon,
        cancelIcon,
        maxIcon,
        minIcon } = icons;

    const extraConfig = {
        uploader: {
            insertImageAsBase64URI: true,
            toolbarStickyOffset: 30,
        },
        autofocus: props.editOnDemand || showFullScreen,
    };

    const fullScreenButton = isObject(props.fullScreen) ? props.fullScreen as ButtonEXProps : null;

    const options = props.kitchensink ? {
        speech: true,
        spellcheck: true,
        table: true,
        media: true,
        source: true,
        fullScreen: true
    } : props


    Jodit.defaultOptions.controls.save = {
        template: () => saveIcon,
        exec: (view: JoditExpanded) => {
            view.kwizInstance.props.onChange?.(view.value);
            view.kwizInstance.props.onSave?.(view.value);
            view.kwizInstance.setShowFullScreen(false);
        }
    };
    Jodit.defaultOptions.controls.cancel = {
        template: () => cancelIcon,
        exec: (view: JoditExpanded) => {
            view.kwizInstance.props.onCancel?.();
            view.kwizInstance.setShowFullScreen(false);
        }
    };
    Jodit.defaultOptions.controls.maximize = {
        template: () => maxIcon,
        exec: (view: JoditExpanded) => {
            view.kwizInstance.props.onChange?.(view.value);//pass value from smaller editor to bigger one
            view.kwizInstance.setShowFullScreen(true);
        }
    };
    Jodit.defaultOptions.controls.minimize = {
        template: () => minIcon,
        exec: (view: JoditExpanded) => {
            view.kwizInstance.props.onChange?.(view.value);
            view.kwizInstance.setShowFullScreen(false);
        }
    };

    const minimalToolbar = !showFullScreen && options.fullScreen;
    const buttons = (minimalToolbar
        ? `${props.onSave && 'save,'}${props.onCancel && 'cancel,'}maximize,bold,ul,ol`//inline, with full screen option - show very minimal toolbar
        : `${props.onSave && 'save,'}${props.onCancel && 'cancel,'}${options.fullScreen && (showFullScreen
            ? fullScreenButton ? 'save,' : 'minimize,'//when in full screen, if we don't have a small editor but just a button - change the minimize button to save&close button
            : 'maximize,')}${(props.onSave || props.onCancel || options.fullScreen) && '|,'}bold,italic,underline,strikethrough,|,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,copyformat,brush,eraser,|,${options.media && 'image,video,'}${options.spellcheck && 'spellcheck,'}${options.speech && 'speechRecognize,'}hr,${options.table && 'table,'}link,indent,outdent,${options.source && '---,source,'}`)
        .replace(/undefined/g, '');
    const removeButtons: string[] = minimalToolbar
        //some buttons must be explicitly removed
        ? ["strikethrough", "italic", "eraser", "font", "fontsize", "paragraph", "lineHeight", "brush", "underline"]
        : undefined;

    const config = {
        ...extraConfig,
        readonly: props.readonly,
        inline: true,
        statusbar: false,
        toolbarButtonSize: props.smallToolbar ? "xsmall" : "middle",
        buttons, removeButtons,
        toolbarAdaptive: !minimalToolbar,
        // events: {
        //     afterInit: (view: IViewBasedExpanded) => {
        //         view.kwizInstance = {
        //             props: props,
        //             setShowFullScreen: setShowFullScreen
        //         };
        //     }
        // }
    };
    const editorElement = <JoditEditor key={"the-editor"}
        {...({
            editorRef: (view: JoditExpanded) => {
                //expand it for toolbar buttons
                view.kwizInstance = {
                    props: props,
                    setShowFullScreen: setShowFullScreen
                };
                editorRef.current = view;
            }
        })}
        value={props.value || ""}
        config={{ ...config as any }}
        onBlur={newContent => {
            props.onChange?.(newContent);
            setActive(false);
        }} // preferred to use only this option to update the content for performance reasons
    //onChange={newContent => {            }}
    />;

    return (showFullScreen
        ? <Section fullscreen="portal">
            {editorElement}
        </Section>
        : fullScreenButton
            ? <ButtonEX {...fullScreenButton} onClick={() => {
                setShowFullScreen(true);
            }} />
            : props.editOnDemand && !active
                ? <div className={classes.htmlDiv} dangerouslySetInnerHTML={{ __html: props.value || "" }}
                    tabIndex={0} onFocus={() => setActive(true)}
                    onClick={() => setActive(true)} />
                : editorElement
    );
}
