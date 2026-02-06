import { makeStyles, MenuProps, tabClassNames } from "@fluentui/react-components";
import { MoreVerticalRegular } from "@fluentui/react-icons";
import { CommonLogger, isNullOrEmptyString, isNumber } from "@kwiz/common";
import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { useElementSize, useRefWithState } from "../helpers";
import { useKWIZFluentContext } from "../helpers/context-internal";
import { KnownClassNames } from "../styles";
import { ButtonEXProps } from "./button";
import { Horizontal, iHorizontalProps } from "./horizontal";
import { iMenuExProps, MenuEx } from "./menu";
import { Section } from "./section";
import { Vertical } from "./vertical";

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
    /** makes this a vertical overflow */
    vertical?: boolean;
    overflowButtonProps?: Partial<ButtonEXProps>;
    overflowProps?: Partial<iMenuExProps>;
    /** optional, send in a maxHeight or maxWidth to the root component */
    size?: string;
    /** if you would like to update the priority/overflow when seleciton changes even if size did not change - set this prop */
    selection?: unknown;
    ref?: React.Ref<HTMLDivElement>;
}

const OverflowMenu = <ItemType,>(props: iOverflowV2Props<ItemType> & {
    overflowItems: {
        item: ItemType;
        /** used internally for the overflow menu */
        $originalIndex?: number;
    }[];
}) => {
    const ctx = useKWIZFluentContext();
    const closeMenu = useRef<() => void>();

    if (props.overflowItems.length === 0) return undefined;
    else if (props.renderOverflowMenuButton)
        return props.renderOverflowMenuButton(props);

    const moreText = ctx.strings?.more_param?.({ cap: true, param: ctx.strings?.items?.() || "items" }) || "More items";
    return <MenuEx menuProps={props.menu} closeMenu={closeMenu}
        trigger={{
            icon: props.menuIcon || <MoreVerticalRegular />,
            title: moreText, showTitleWithIcon: props.vertical,
            dontStretch: true, dontCenterText: true,
            iconPosition: props.vertical ? "after" : "before",
            ...(props.overflowButtonProps || {})
        }}
        items={props.overflowItems.map((oItem) => ({
            title: `s${oItem.$originalIndex}`, onClick: () => { }, as: <Section key={`s${oItem.$originalIndex}`} onClick={() => closeMenu.current?.()}>{props.renderItem(oItem.item, oItem.$originalIndex, true)}</Section>
        }))}
    />;
}

const useStyles = makeStyles({
    root: {
        overflow: "hidden",
        width: "100%",
        maxWidth: "100%"
    },
    nowrap: {
        whiteSpace: "nowrap",
    },
    nowrapTabs: {
        [`& .${tabClassNames.content}`]: {
            overflow: "visible",
        }
    },
    rootVertical: {
        overflow: "hidden",
        height: "100%",
        maxHeight: "100%"
    }
});

export const KWIZOverflowV2 = <ItemType,>(props: PropsWithChildren<iOverflowV2Props<ItemType>>) => {
    const css = useStyles();
    const wrapperRef = useRefWithState<HTMLDivElement>(undefined, undefined, props.ref);
    const size = useElementSize(wrapperRef.ref.current);
    const [overflowIndexes, setOverflowIndexes] = useState<number[]>([]);

    function getPriority(item: ItemType) {
        const p = props?.priority?.(item) || 0;
        if (!isNumber(p) || p < 0) return 0;
        else return p;
    }

    function tooBig(div: HTMLDivElement) {
        return props.vertical
            ? div.scrollHeight > div.clientHeight
            : div.scrollWidth > div.clientWidth;
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
                && tooBig(div)
            ) {
                const currentLevelChildren = allChildren.filter(c => c.priority === currentPriority);
                currentPriority++;

                let currentChild = 0;//exit loop
                while (
                    //have more children
                    currentChild < currentLevelChildren.length
                    //still need to hide items
                    && tooBig(div)
                ) {
                    const child = currentLevelChildren[currentChild++];
                    newOverflowIndexes.push(child.itemIndex);
                    child.div.style.display = "none";
                }
            }

            // if (currentPriority > highestPriority)//we progressed beyond the items we have and could not get rid of the scroll
            //     logger.warn("no more items to hide, can't overflow");

            //set the hidden indexes, in their correct order (reverse back)
            setOverflowIndexes(newOverflowIndexes.reverse());
        }
    }, [size.height, size.width, wrapperRef.value, props.items, props.children, props.childrenBefore, props.size, props.selection]);

    const cssClasses = [props.vertical ? css.rootVertical : css.root, (props.nowrap || props.nowrapTabs) && css.nowrap, props.nowrapTabs && css.nowrapTabs,
    ...(props.root?.css || [])
    ];

    const Wrapper = (props.vertical ? Vertical : Horizontal);

    useEffect(() => {
        setOverflowIndexes([]);
    }, [props.items]);

    return (
        <Wrapper ref={wrapperRef.set} {...props.root} css={cssClasses} style={isNullOrEmptyString(props.size)
            ? undefined
            : props.vertical ? { minHeight: props.size, maxHeight: props.size } : { width: props.size }}>
            {props.childrenBefore}
            {props.items.map((item, index) => <Section key={`s${index}`} rootProps={{
                "data-item-index": index//set the item id - we use it using dataset.itemIndex
            } as any}>{props.renderItem(item, index, false)}</Section>)}
            <OverflowMenu {...props} overflowItems={overflowIndexes.map(itemIndex => ({ item: props.items[itemIndex], $originalIndex: itemIndex }))} />
            {props.children}
        </Wrapper>
    );
};