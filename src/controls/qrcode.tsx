import { colorToHex } from '@kwiz/common';
import QRCode from 'qrcode';
import React, { useEffect, useRef } from 'react';

interface IProps {
    value: string;
    color?: string;
    width?: number;
    backgroundColor?: string;
    foregroundColor?: string;
}

export const QRCodeEX: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const container = useRef<HTMLCanvasElement>();
    useEffect(() => {
        if (container.current) {
            let dark = props.foregroundColor ? colorToHex(props.foregroundColor) : "#000000ff";
            let light = props.backgroundColor ? colorToHex(props.backgroundColor) : "#ffffffff";
            QRCode.toCanvas(container.current, props.value, {
                color: {
                    dark,
                    light
                },
                width: props.width
            });
        }
    }, [container]);
    return (
        <canvas ref={container} />
    );
}