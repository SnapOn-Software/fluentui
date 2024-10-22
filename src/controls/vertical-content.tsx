import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { isNotEmptyArray } from '@kwiz/common';
import React from 'react';
import { useWindowSize } from '../helpers/hooks';

const useStyles = makeStyles({
    verticalContainer: {
        position: "relative",
        ['& > div']: {
            position: "absolute",
            transform: "rotate(90deg)"
        }
    }
});

interface IProps {
    css?: string[];
}
export const VerticalContent: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const classes = useStyles();
    let css: string[] = [classes.verticalContainer];
    const size = useWindowSize();

    let div = React.useRef();
    let rotate = React.useRef();

    if (isNotEmptyArray(props.css)) css.push(...props.css);

    React.useEffect(() => {
        if (div.current && rotate.current) {
            let rootDiv = (div.current as HTMLDivElement);
            let rotateDiv = (rotate.current as HTMLDivElement);
            rootDiv.style.height = `${rotateDiv.clientWidth}px`;
            rootDiv.style.width = `${rotateDiv.clientHeight}px`;
            rootDiv.style.minHeight = `${rotateDiv.clientWidth}px`;
            rootDiv.style.minWidth = `${rotateDiv.clientHeight}px`;

            rotateDiv.style.top = `${(rotateDiv.clientWidth - rotateDiv.clientHeight) / 2}px`;
            rotateDiv.style.left = `-${(rotateDiv.clientWidth - rotateDiv.clientHeight) / 2}px`;
        }
    }, [div, rotate, size.height, size.width]);

    return (
        <div ref={div} className={mergeClasses(...css)}>
            <div ref={rotate}>
                {props.children}
            </div>
        </div>
    );
}