import { Menu, MenuButton, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { MoreVerticalFilled } from "@fluentui/react-icons";
import { CommonLogger } from "@kwiz/common";
import { PropsWithChildren, useEffect, useState } from "react";
import { useElementSize, useRefWithState } from "../helpers";
import { useKWIZFluentContext } from "../helpers/context-internal";
import { KnownClassNames } from "../styles";
import { Horizontal, iHorizontalProps } from "./horizontal";
import { Section } from "./section";

const logger = new CommonLogger("OverflowV2");

export interface iOverflowV2Props<ItemType> {
    /** you cannot have a menu with trigger in overflow items. put those in groupWrapper controls before/after rendering children. */
    items: ItemType[];
    /** when overflow:true, if using the OOB menu, should return a <MenuItem> */
    renderItem: (item: ItemType, index: number, overflow?: boolean) => JSX.Element;
    /** items will only have the items that need to overflow */
    renderOverflowMenuButton?: (props: iOverflowV2Props<ItemType>) => JSX.Element;
    root?: iHorizontalProps;
    nowrap?: boolean;
    childrenBefore?: JSX.Element;
}


const OverflowMenu = <ItemType,>(props: iOverflowV2Props<ItemType>) => {
    const ctx = useKWIZFluentContext();
    if (props.items.length === 0) return undefined;
    else if (props.renderOverflowMenuButton)
        return props.renderOverflowMenuButton(props);
    return <Menu mountNode={ctx.mountNode}>
        <MenuTrigger disableButtonEnhancement>
            <MenuButton
                icon={<MoreVerticalFilled />}
                aria-label="More items"
                appearance="subtle"
            />
        </MenuTrigger>
        <MenuPopover>
            <MenuList>
                {props.items.map((item, index) => <Section key={`s${index}`}>{props.renderItem(item, index, true)}</Section>)}
            </MenuList>
        </MenuPopover>
    </Menu>;
}

export const KWIZOverflowV2 = <ItemType,>(props: PropsWithChildren<iOverflowV2Props<ItemType>>) => {
    const wrapperRef = useRefWithState<HTMLDivElement>();
    const size = useElementSize(wrapperRef.ref.current);
    const [overflowItems, setOverflowItems] = useState(0);
    useEffect(() => {
        if (wrapperRef.ref.current) {
            const div = wrapperRef.ref.current;
            const childrenE = div.querySelectorAll(`:scope>.${KnownClassNames.section}`);
            const children: HTMLDivElement[] = [];
            childrenE.forEach(e => children.push(e as HTMLDivElement));
            children.forEach(c => c.style.display = "");
            children.reverse();
            let overflowItems = 0;
            while (div.scrollWidth > div.clientWidth) {
                if (overflowItems >= children.length) { logger.warn("no more items to hide, can't overflow"); break; }
                else {
                    children[overflowItems++].style.display = "none";
                }
            }
            setOverflowItems(overflowItems);
        }
    }, [size.height, size.width, wrapperRef.value]);

    return (
        <Horizontal ref={wrapperRef.set} style={{ overflow: "hidden", whiteSpace: props.nowrap ? "nowrap" : undefined }} {...props.root}>
            {props.childrenBefore}
            {props.items.map((item, index) => <Section key={`s${index}`}>{props.renderItem(item, index, false)}</Section>)}
            <OverflowMenu {...props} items={props.items.slice(props.items.length - overflowItems)} />
            {props.children}
        </Horizontal>
    )
};