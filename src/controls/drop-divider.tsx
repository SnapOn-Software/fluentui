import { makeStyles, mergeClasses, shorthands, tokens } from '@fluentui/react-components';
import { AddCircleRegular, FluentIcon, MoreHorizontalRegular, MoreVerticalRegular } from '@fluentui/react-icons';
import { useMemo } from 'react';
import { DividerEX } from './divider';

const useStyles = makeStyles({
    dropDivider: {
        "::before": {
            ...shorthands.borderWidth(tokens.strokeWidthThickest),
        },
        "::after": {
            ...shorthands.borderWidth(tokens.strokeWidthThickest),
        },
    },
    dropDividerOver: {
        "::before": {
            ...shorthands.borderColor(tokens.colorBrandBackground),
        },
        "::after": {
            ...shorthands.borderColor(tokens.colorBrandBackground),
        },
    }
});
interface iProps {
    vertical?: boolean;
    label?: string;
    drop: {
        isOver: boolean;
        dropRef: (element: HTMLDivElement | null) => void;
    };
    expectingDrop: boolean;
    /** show the divider even when not hovering to drop */
    showWhenNotOver?: boolean;
    /** use a different icon when not hovering to drop */
    notOverIcon?: FluentIcon;
    /** provide an on click handler when not hovering to drop */
    onClick?: () => void;
}

/** use by passing a useDragDropContext with dropInfo, pass the props as-is <DropDivider {...dropContext} /> */
export function DropDivider(props: iProps) {
    const classes = useStyles();

    const NoOverIcon = useMemo(() => props.notOverIcon || (props.vertical ? AddCircleRegular : MoreHorizontalRegular), [props.vertical, props.notOverIcon]);

    return props.expectingDrop
        ? <DividerEX ref={props.drop.dropRef} className={mergeClasses(classes.dropDivider, props.drop && props.drop.isOver && classes.dropDividerOver)} vertical={props.vertical} title={props.label || "insert here"}>
            {props.vertical ? <MoreVerticalRegular /> : <MoreHorizontalRegular />}
        </DividerEX>
        : props.showWhenNotOver ? <DividerEX vertical={props.vertical} title={props.label || "insert here"} onClick={props.onClick}>
            <NoOverIcon />
        </DividerEX> : undefined;
}