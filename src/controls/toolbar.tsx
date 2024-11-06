import { Toolbar, ToolbarDivider, ToolbarGroup } from '@fluentui/react-components';
import React from 'react';
import { useCommonStyles } from '../styles/styles';
import { KWIZOverflow } from './kwizoverflow';

interface IProps {
    /** toolbar buttons that may render or render in overflow */
    buttonGroups: { elm: JSX.Element, overflowElement?: JSX.Element }[][];
    /** side buttons that will always render, never overflow */
    sideButtons?: JSX.Element;
}
export const ToolbarEX: React.FunctionComponent<IProps> = (props) => {
    const commonCssNames = useCommonStyles();

    let elements: { id: string, priority?: number, elm: JSX.Element, overflowElement?: JSX.Element }[] = [];
    props.buttonGroups.forEach((group, groupIndex) => {
        group.forEach((button, buttonIndex) => {
            const mapped = { ...button, id: `m${groupIndex}-${buttonIndex}` };
            if (buttonIndex === 0 && groupIndex > 0 && props.buttonGroups[groupIndex - 1].length > 0) {
                //first button, not first group, and previous group was not empty
                //add divider
                mapped.overflowElement = mapped.overflowElement || mapped.elm;
                //this way if button rendes it is with the divider, but if it is in overflow - there will be no divider
                mapped.elm = <span>
                    <ToolbarDivider style={{ display: 'inline-flex' }} />
                    {mapped.elm}
                </span>;

            }
            elements.push(mapped);
        })
    });

    return (
        <KWIZOverflow className={commonCssNames.printHide}
            items={elements}
            getKey={e => e.id}
            renderItem={(e, i, overflow) => overflow && e.overflowElement || e.elm}
            getPriority={e => e.priority || -1}
            groupWrapper={children => <Toolbar aria-label="Default" style={{ justifyContent: "space-between" }}>
                <ToolbarGroup role="presentation">
                    {children}
                </ToolbarGroup>
                <ToolbarGroup role="presentation">
                    {props.sideButtons}
                </ToolbarGroup>
            </Toolbar>}
        />);
}