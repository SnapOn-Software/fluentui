import { makeStyles, Menu, MenuButton, MenuList, MenuPopover, MenuProps, MenuTrigger, tabClassNames } from "@fluentui/react-components";
import { MoreVerticalRegular } from "@fluentui/react-icons";
import { CommonLogger, isNumber } from "@kwiz/common";
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
    root?: Partial<iHorizontalProps>;
    nowrap?: boolean;
    /** if you have this inside a TabList, turn this flag on to make sure tabs don't wrap / shrink text */
    nowrapTabs?: boolean;
    childrenBefore?: JSX.Element;
    menu?: Partial<MenuProps>;
    menuIcon?: JSX.Element;
    /** when hiding items, lower priority items will be collapsed first */
    priority?: (item: ItemType) => number;
}

const OverflowMenu = <ItemType,>(props: iOverflowV2Props<ItemType>) => {
    const ctx = useKWIZFluentContext();
    if (props.items.length === 0) return undefined;
    else if (props.renderOverflowMenuButton)
        return props.renderOverflowMenuButton(props);
    return <Menu mountNode={ctx.mountNode} {...(props.menu || {})}>
        <MenuTrigger disableButtonEnhancement>
            <MenuButton
                icon={props.menuIcon || <MoreVerticalRegular />}
                aria-label={ctx.strings?.more_param?.({ cap: true, param: ctx.strings?.items?.() || "items" }) || "More items"}
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

const useStyles = makeStyles({
    root: {
        overflow: "hidden",
        width: "100%"
    },
    nowrap: {
        whiteSpace: "nowrap",
    },
    nowrapTabs: {
        [`& .${tabClassNames.content}`]: {
            overflow: "visible",
        }
    },
});
export const KWIZOverflowV2 = <ItemType,>(props: PropsWithChildren<iOverflowV2Props<ItemType>>) => {
    const css = useStyles();
    const wrapperRef = useRefWithState<HTMLDivElement>();
    const size = useElementSize(wrapperRef.ref.current);
    const [overflowIndexes, setOverflowIndexes] = useState<number[]>([]);

    function getPriority(item: ItemType) {
        const p = props?.priority?.(item) || 0;
        if (!isNumber(p) || p < 0) return 0;
        else return p;
    }

    useEffect(() => {
        if (wrapperRef.ref.current) {
            const div = wrapperRef.ref.current;
            const childrenE = div.querySelectorAll(`:scope>.${KnownClassNames.section}`);
            let allChildren: { div: HTMLDivElement, priority: number; itemIndex: number; }[] = [];
            let highestPriority = 0;
            childrenE.forEach(e => {
                const div = e as HTMLDivElement;
                const itemIndex = Number(div.dataset.itemIndex);
                if (itemIndex > 0 && itemIndex <= props.items.length) {
                    const priority = getPriority(props.items[itemIndex]);
                    if (priority > highestPriority) highestPriority = priority;
                    allChildren.push({ div, priority, itemIndex });
                }
            });

            //show all items to provoke overflow
            allChildren.forEach(c => c.div.style.display = "");
            //reverse order so we start hiding last items
            allChildren.reverse();
            //collect hidden items indexes here
            const newOverflowIndexes: number[] = [];

            let currentPriority = 0;//exit loop
            while (
                //have more higher priority items to hide
                currentPriority <= highestPriority
                //still need to hide items
                && div.scrollWidth > div.clientWidth
            ) {
                const currentLevelChildren = allChildren.filter(c => c.priority === currentPriority);
                currentPriority++;

                let currentChild = 0;//exit loop
                while (
                    //have more children
                    currentChild < currentLevelChildren.length
                    //still need to hide items
                    && div.scrollWidth > div.clientWidth
                ) {
                    const child = currentLevelChildren[currentChild++];
                    newOverflowIndexes.push(child.itemIndex);
                    child.div.style.display = "none";
                }
            }

            if (currentPriority > highestPriority)//we progressed beyond the items we have and could not get rid of the scroll
                logger.warn("no more items to hide, can't overflow");

            //set the hidden indexes, in their correct order (reverse back)
            setOverflowIndexes(newOverflowIndexes.reverse());
        }
    }, [size.height, size.width, wrapperRef.value, props.items, props.children, props.childrenBefore]);

    const cssClasses = [css.root, (props.nowrap || props.nowrapTabs) && css.nowrap, props.nowrapTabs && css.nowrapTabs,
    ...(props.root?.css || [])
    ];

    return (
        <Horizontal ref={wrapperRef.set} {...props.root} css={cssClasses}>
            {props.childrenBefore}
            {props.items.map((item, index) => <Section key={`s${index}`} rootProps={{
                "data-item-index": index//set the item id - we use it using dataset.itemIndex
            } as any}>{props.renderItem(item, index, false)}</Section>)}
            <OverflowMenu {...props} items={overflowIndexes.map(itemIndex => props.items[itemIndex])} />
            {props.children}
        </Horizontal>
    );
};