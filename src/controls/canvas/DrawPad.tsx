import { Field, tokens } from "@fluentui/react-components";
import { ArrowMaximizeRegular, ArrowMinimizeRegular, ArrowUploadRegular, CalligraphyPenRegular, DismissRegular } from "@fluentui/react-icons";
import { debounce, getCSSVariableValue, ImageFileTypes, isElement, isNotEmptyString, isNullOrEmptyArray, isNullOrEmptyString, isNullOrUndefined } from "@kwiz/common";
import * as React from "react";
import { useAlerts, useElementSize, useStateEX } from "../../helpers/hooks";
import { ButtonEX } from "../button";
import { ColorPickerEx } from "../ColorPickerDialog";
import { FileUpload } from "../file-upload";
import { Horizontal } from "../horizontal";
import { InputEx } from "../input";
import { Vertical } from "../vertical";
import DrawPadManager from "./DrawPadManager";

interface iProps {
    BackgroundColor?: string;
    BorderColor?: string;
    LineColor?: string;
    minWidth?: number;
    minHeight?: number;
    /** url or  base64 image data:image/png;base64,.... */
    Value?: string;
    /** when user hits clear, it will reset to this value
     * url or base64 image data:image/png;base64,....
     */
    DefaultBackdrop?: string;
    OnChange?: (newValue: string) => void;
    ReadOnly?: boolean;
    HideUpload?: boolean;
    HideClear?: boolean;
    HideColorPicker?: boolean;
    disabled?: boolean;
    /** true - will prompt user for his name, string will just sign as that string */
    allowSigning?: boolean | string;
    allowFullscreen?: boolean;
}
var _userName: string = null;
export const DrawPadUserName = {
    get: () => { return _userName },
    set: (userName: string) => { _userName = userName }
};
export const DrawPad: React.FunctionComponent<iProps> = (props) => {
    const [LineColor, setLineColor] = useStateEX<string>(props.LineColor || tokens.colorBrandForeground1);
    const [manager, setmanager] = useStateEX<DrawPadManager>(null);
    const [canUndo, setcanUndo] = useStateEX<boolean>(false, { skipUpdateIfSame: true });
    const [loadedFontNames, setloadedFontNames] = useStateEX<string[]>([]);
    const [signed, setSigned] = useStateEX<boolean>(false);
    const [fullscreen, setFullscreen] = useStateEX<boolean>(false);
    const onChangeRef = React.useRef(props.OnChange);
    const alerts = useAlerts();
    const canvasArea: React.RefObject<HTMLCanvasElement> = React.useRef();
    const canvasContainerDiv = React.useRef<HTMLDivElement>();

    //keep onChange up to date
    React.useEffect(() => {
        onChangeRef.current = props.OnChange;
    }, [props.OnChange]);
    //if user name provided - keep it
    React.useEffect(() => {
        if (isNotEmptyString(props.allowSigning)) {
            DrawPadUserName.set(props.allowSigning);
        }
    }, [props.allowSigning]);

    //load font for sign as text, if needed
    React.useEffect(() => {
        if (props.allowSigning && isNullOrEmptyArray(loadedFontNames)) {
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
    }, [props.allowSigning, loadedFontNames]);

    //setup manager
    React.useEffect(() => {
        if (!props.ReadOnly && canvasArea.current && !canvasArea.current["canvas_initialized"]) {
            canvasArea.current["canvas_initialized"] = true;//for some reason this still fires twice on the same div
            //this gets called after each render...
            let manager = new DrawPadManager(canvasArea.current);
            setmanager(manager);
            manager.addEventListener("endStroke", () => {
                //because this is used in an addEventListener - need to have a ref to get the most up to date onChange
                if (onChangeRef.current) {
                    let canvasValue = manager.toPng();
                    setcanUndo(true);//todo - enable undo last??
                    onChangeRef.current(canvasValue);
                }
            });
        }
    }, [canvasArea]);
    //update line color selection
    React.useEffect(() => {
        if (manager) {
            manager.penColor.value = getCSSVariableValue(LineColor, canvasArea.current);
        }
    }, [manager, LineColor]);

    //Set props value to canvas on initial load or when owner element changes the prop
    React.useEffect(() => {
        if (manager) {
            let canvasValue = manager.toPng();
            let neededValue = isNotEmptyString(props.Value)
                ? props.Value
                : isNotEmptyString(props.DefaultBackdrop)
                    ? props.DefaultBackdrop
                    : "";
            if (canvasValue !== neededValue) {
                UpdateCanvas(neededValue);//if called repeatedly or too fast - may not load correctly
            }
        }
    });//cant use those - canvas loses value on drag so must run this every time: [props.Value, props.DefaultBackdrop, manager]);

    //set value to canvas
    const UpdateCanvas = React.useCallback(debounce((valueToSet: string) => {
        if (valueToSet === "") manager.clear();
        else manager.fromDataURL(valueToSet);
    }, 200, this), [manager]);

    //enable/disable canvas manager
    React.useEffect(() => {
        if (manager) {
            if (props.disabled) manager.off();//stop accepting strokes, but still allow to set a default value
            else manager.on();
        }
    }, [manager, props.disabled]);

    const sign = React.useCallback((name: string) => {
        let canvas = canvasArea.current;
        if (!isElement(canvas)) {
            return;
        }
        setSigned(true);

        let height = canvas.clientHeight;
        let width = canvas.clientWidth;
        let fontName = loadedFontNames[0];

        let ctx = canvas.getContext("2d");
        ctx.fillStyle = getCSSVariableValue(LineColor, canvasArea.current);

        let fontSize = 0.6 * height;
        ctx.font = `${fontSize}px ${fontName}`;
        let textMeasurement = ctx.measureText(name);
        let textWidth = textMeasurement.width;
        let maxWidth = 0.9 * width;

        while (textWidth > maxWidth && fontSize > 1) {
            fontSize = fontSize - 1;
            ctx.font = `${fontSize}px ${fontName}`;
            textMeasurement = ctx.measureText(name);
            textWidth = textMeasurement.width;
        }

        let x = (width - textWidth) / 2;
        let y = 0.6 * height; //baseline not starting point
        ctx.fillText(name, x, y, width);
        let url = canvas.toDataURL("image/png");
        onChangeRef.current?.(url);
    }, [canvasArea, LineColor]);

    const onSignAs = React.useCallback(async () => {
        if (isNullOrUndefined(DrawPadUserName.get())) {
            //prompt user to type his name - then continue
            alerts.promptEX({
                mountNode: canvasContainerDiv.current,
                title: "Sign as name",
                children: <Field label="Signing as" hint="Please type in your name" required>
                    <InputEx onChange={(e, data) => DrawPadUserName.set(data.value)} />
                </Field>,
                onCancel: () => {
                    DrawPadUserName.set(null);//get rid of anything they typed while dialog was open
                },
                onOK: () => {
                    if (!isNullOrEmptyString(DrawPadUserName.get()))//need to test current since this won't be updated when state changes
                    {
                        sign(DrawPadUserName.get());
                    }
                },
            });
        }
        else sign(DrawPadUserName.get());
    }, [canvasArea, LineColor]);

    const HideButtons = props.HideClear && props.HideColorPicker && props.HideUpload;

    const sizer = useElementSize(canvasContainerDiv.current);
    const [size, setSize] = useStateEX<{ width?: number; height?: number }>({});
    //handle canvas resizing
    React.useEffect(() => {
        if (canvasContainerDiv.current) {
            setSize({
                width: canvasContainerDiv.current.clientWidth,
                height: canvasContainerDiv.current.clientHeight,
            });
            if (manager) manager.resizeCanvas();
        }
    }, [canvasContainerDiv, sizer, manager]);

    return <Horizontal nogap fullscreen={fullscreen}>
        {alerts.alertPrompt}
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
                ? <img src={isNotEmptyString(props.Value) ? props.Value : props.DefaultBackdrop} style={{ position: "absolute", left: 0, top: 0, width: size.width, height: size.height }} />
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
                    {!signed
                        && !isNullOrEmptyString(props.allowSigning)
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
                            disabled={props.disabled}
                            icon={<CalligraphyPenRegular />}
                            title={`Sign as ${props.allowSigning === true ? "..." : props.allowSigning}`}
                            onClick={() => {
                                onSignAs();
                            }}
                        />}
                </div>
            }
        </div>
        {!props.ReadOnly && !HideButtons && <Vertical nogap>
            {props.HideColorPicker || <ColorPickerEx mountNode={canvasContainerDiv.current} disabled={props.disabled} buttonOnly value={props.LineColor} onChange={newColor => {
                setLineColor(newColor);
            }} />}
            {props.HideClear || <ButtonEX disabled={props.disabled || isNullOrEmptyString(props.Value)} title="Clear" icon={<DismissRegular />} onClick={() => {
                //can call clear on the canvas, or can call the onchange which will cause a re-draw
                setSigned(false);
                onChangeRef.current?.("");
            }} />}
            {props.HideUpload || <FileUpload disabled={props.disabled} title="Load background image" icon={<ArrowUploadRegular />} limitFileTypes={ImageFileTypes} asBase64={base64 => {
                if (onChangeRef.current)
                    onChangeRef.current?.(base64[0].base64);//this will trigger a change and state update
                else
                    manager?.fromDataURL(base64[0].base64);//this will just set the image to the canvas but won't trigger a change event for the caller
            }} />}
            {props.allowFullscreen && <ButtonEX title="Full screen" disabled={props.disabled} icon={fullscreen ? <ArrowMinimizeRegular /> : <ArrowMaximizeRegular />} onClick={async () => {
                //can call clear on the canvas, or can call the onchange which will cause a re-draw
                await setFullscreen(!fullscreen);
                if (manager) manager.resizeCanvas();
            }} />}
        </Vertical>}
    </Horizontal>;
}