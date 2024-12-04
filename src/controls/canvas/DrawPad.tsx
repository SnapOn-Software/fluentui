import { tokens } from "@fluentui/react-components";
import { ArrowUploadRegular, CalligraphyPenRegular, DismissRegular } from "@fluentui/react-icons";
import { ImageFileTypes, debounce, isElement, isFunction, isNullOrEmptyArray, isNullOrEmptyString } from "@kwiz/common";
import * as React from "react";
import { useElementSize, useStateEX } from "../../helpers/hooks";
import { ButtonEX } from "../button";
import { ColorPickerEx } from "../ColorPickerDialog";
import { FileUpload } from "../file-upload";
import { Horizontal } from "../horizontal";
import { Vertical } from "../vertical";
import DrawPadManager from "./DrawPadManager";

interface iProps {
    BackgroundColor?: string;
    BorderColor?: string;
    LineColor?: string;
    minWidth?: number;
    minHeight?: number;
    Value?: string;
    OnChange?: (newValue: string) => void;
    ReadOnly?: boolean;
    SignAsText?: string;
    HideUpload?: boolean;
    HideClear?: boolean;
    HideColorPicker?: boolean;
    disabled?: boolean;
}
export const DrawPad: React.FunctionComponent<iProps> = (props) => {
    const [LineColor, setLineColor] = useStateEX<string>(props.LineColor || tokens.colorBrandForeground1);
    const [manager, setmanager] = useStateEX<DrawPadManager>(null);
    const [canUndo, setcanUndo] = useStateEX<boolean>(false);
    const [loadedFontNames, setloadedFontNames] = useStateEX<string[]>([]);

    const canvasArea: React.RefObject<HTMLCanvasElement> = React.useRef();
    const canvasContainerDiv = React.useRef<HTMLDivElement>();

    //load font for sign as text
    React.useEffect(() => {
        if (props.SignAsText && isNullOrEmptyArray(loadedFontNames)) {
            let DancingScriptFont = new FontFace(
                "Dancing Script",
                "url(https://fonts.gstatic.com/s/dancingscript/v25/If2RXTr6YS-zF4S-kcSWSVi_szLgiuE.woff2) format('woff2')",
                {
                    style: "normal",
                    weight: "400 700",
                    display: "swap",
                    unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
                }
            );

            DancingScriptFont.load().then(async loadedFont => {
                document.fonts.add(loadedFont);
                await document.fonts.ready;
                setloadedFontNames(["Dancing Script"]);
            });
        }
    }, [props.SignAsText, loadedFontNames]);

    //setup manager
    React.useEffect(() => {
        if (!props.ReadOnly && canvasArea.current && !canvasArea.current["canvas_initialized"]) {
            canvasArea.current["canvas_initialized"] = true;//for some reason this still fires twice on the same div
            //this gets called after each render...
            let manager = new DrawPadManager(canvasArea.current);
            setmanager(manager).then(() => UpdateCanvas());
            if (isFunction(props.OnChange)) {
                manager.addEventListener("endStroke", () => {
                    let value = "";
                    if (!manager.isEmpty()) {
                        value = manager.toDataURL("image/png");
                    }
                    if (!canUndo)
                        setcanUndo(true);

                    props.OnChange(value);
                });
            }
        }
    }, [canvasArea]);
    React.useEffect(() => {
        if (!props.ReadOnly) {
            UpdateCanvas();
        }
    });//run every time after render

    React.useEffect(() => {
        if (manager) {
            if (props.disabled) manager.off();//stop accepting strokes, but still allow to set a default value
            else manager.on();
        }
    }, [manager, props.disabled]);

    //set value to canvas
    const UpdateCanvas = React.useCallback(debounce(() => {
        if (manager) {
            manager.penColor.value = LineColor;

            if (!isNullOrEmptyString(props.Value))
                manager.fromDataURL(props.Value, { clear: true });
            else
                manager.clear();
        }
    }, 200, this), [manager, props.Value, LineColor]);

    const onSignAs = React.useCallback(() => {
        let canvas = canvasArea.current;
        if (!isElement(canvas)) {
            return;
        }

        let height = canvas.clientHeight;
        let width = canvas.clientWidth;
        let fontName = loadedFontNames[0];
        let signAs = props.SignAsText;

        let ctx = canvas.getContext("2d");
        ctx.fillStyle = LineColor || LineColor || tokens.colorBrandForeground1;

        let fontSize = 0.6 * height;
        ctx.font = `${fontSize}px ${fontName}`;
        let textMeasurement = ctx.measureText(signAs);
        let textWidth = textMeasurement.width;
        let maxWidth = 0.9 * width;

        while (textWidth > maxWidth && fontSize > 1) {
            fontSize = fontSize - 1;
            ctx.font = `${fontSize}px ${fontName}`;
            textMeasurement = ctx.measureText(signAs);
            textWidth = textMeasurement.width;
        }

        let x = (width - textWidth) / 2;
        let y = 0.6 * height; //baseline not starting point
        ctx.fillText(signAs, x, y, width);
        let url = canvas.toDataURL("image/png");
        props.OnChange(url);
    }, [canvasArea, props.OnChange]);

    const HideButtons = props.HideClear && props.HideColorPicker && props.HideUpload;

    const sizer = useElementSize(canvasContainerDiv.current);
    const [size, setSize] = useStateEX<{ width?: number; height?: number }>({});
    React.useEffect(() => {
        if (canvasContainerDiv.current) {
            setSize({
                width: canvasContainerDiv.current.clientWidth,
                height: canvasContainerDiv.current.clientHeight,
            });
        }
    }, [canvasContainerDiv, sizer]);

    return <Horizontal nogap>
        <div ref={canvasContainerDiv}
            style={{
                flexGrow: 1,
                position: "relative",
                minWidth: props.minWidth,
                minHeight: props.minHeight,
                backgroundColor: props.BackgroundColor,
                border: `1px solid ${props.BorderColor || tokens.colorNeutralStroke1}`
            }}>
            {props.ReadOnly
                ? <img src={props.Value} style={{ position: "absolute", left: 0, top: 0, width: size.width, height: size.height }} />
                :
                <div style={{ position: "absolute", left: 0, top: 0, width: size.width, height: size.height }}>
                    <canvas
                        ref={canvasArea}
                        style={{
                            touchAction: "none",
                            userSelect: "none",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: size.width,
                            height: size.height,
                            border: tokens.colorBrandStroke1
                        }} />
                    {isNullOrEmptyString(props.Value)
                        && !isNullOrEmptyString(props.SignAsText)
                        && !isNullOrEmptyArray(loadedFontNames)
                        && <ButtonEX
                            style={{
                                position: "absolute",
                                bottom: 0,
                                border: 0,
                                margin: 0,
                                right: 0,
                                height: 16
                            }}
                            icon={<CalligraphyPenRegular />}
                            title={`Sign as ${props.SignAsText}`}
                            onClick={() => {
                                onSignAs();
                            }}
                        />}
                </div>
            }
        </div>
        {!props.ReadOnly && !HideButtons && <Vertical nogap>
            {props.HideColorPicker || <ColorPickerEx disabled={props.disabled} buttonOnly value={props.LineColor} onChange={newColor => {
                setLineColor(newColor);
            }} />}
            {props.HideClear || <ButtonEX disabled={props.disabled || isNullOrEmptyString(props.Value)} title="Clear" icon={<DismissRegular />} onClick={() => {
                //can call clear on the canvas, or can call the onchange which will cause a re-draw
                props.OnChange("");
            }} />}
            {props.HideUpload || <FileUpload disabled={props.disabled} title="Load background image" icon={<ArrowUploadRegular />} limitFileTypes={ImageFileTypes} asBase64={base64 => {
                props.OnChange(base64[0].base64);//this will trigger a change and state update
                //self.state.manager.fromDataURL(base64);//this will just set the image to the canvas but won't trigger a change
            }} />}
        </Vertical>}
    </Horizontal>;
}