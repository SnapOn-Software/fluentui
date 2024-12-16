import {
    Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, Overflow, OverflowItem,
    useIsOverflowItemVisible, useOverflowMenu
} from "@fluentui/react-components";
import { MoreHorizontalFilled } from "@fluentui/react-icons";
import { isNumber } from '@kwiz/common';
import { useKWIZFluentContext } from "../helpers/context-internal";

interface IProps<ItemType> {
    /** you cannot have a menu with trigger in overflow items. put those in groupWrapper controls before/after rendering children. */
    items: ItemType[];
    getKey: (item: ItemType, index: number) => string;
    getPriority?: (item: ItemType, index: number) => number;
    renderItem: (item: ItemType, index: number, overflow?: boolean) => JSX.Element;
    groupWrapper?: (children: React.ReactNode) => JSX.Element;
    menuRef?: React.RefObject<HTMLButtonElement>;
    menuWrapper?: (children: React.ReactNode) => JSX.Element;
    menuTrigger?: (ref: React.RefObject<HTMLButtonElement>, overflowCount: number) => JSX.Element;
    className?: string;
}
const OverflowMenu = <ItemType,>(props: IProps<ItemType>) => {
    const ctx = useKWIZFluentContext();

    const { ref, isOverflowing, overflowCount } =
        useOverflowMenu<HTMLButtonElement>();

    if (!isOverflowing) {
        return null;
    }

    let menu = <Menu mountNode={ctx.mountNode}>
        <MenuTrigger disableButtonEnhancement>
            {props.menuTrigger
                ? props.menuTrigger(props.menuRef || ref, overflowCount)
                : <MenuButton
                    icon={<MoreHorizontalFilled />}
                    ref={props.menuRef || ref}
                    aria-label="More items"
                    appearance="subtle"
                />}
        </MenuTrigger>
        <MenuPopover>
            <MenuList>
                {props.items.map((item, index) => (
                    <OverflowMenuItem key={props.getKey(item, index)} {...props} item={item} index={index} />
                ))}
            </MenuList>
        </MenuPopover>
    </Menu>;

    return (
        props.menuWrapper
            ? props.menuWrapper(menu)
            : menu
    );
}

const OverflowMenuItem = <ItemType,>(props: IProps<ItemType> & { item: ItemType, index: number }) => {
    const isVisible = useIsOverflowItemVisible(props.getKey(props.item, props.index));

    if (isVisible) {
        return null;
    }

    return (
        <MenuItem key={props.getKey(props.item, props.index)}>
            {props.renderItem(props.item, props.index, true)}
        </MenuItem>
    );
};
export const KWIZOverflow = <ItemType,>(props: IProps<ItemType>) => {
    let content: JSX.Element[] = [];
    let addMenu = () => {
        if (menuIndex >= 0)
            content.splice(menuIndex, 0, <OverflowMenu key="overflow_menu" {...props} />);
        else
            content.push(<OverflowMenu key="overflow_menu" {...props} />);
    };

    let menuIndex = -1;

    props.items.forEach((item, index) => {
        //add the menu before the first item with priority
        let priority = props.getPriority ? props.getPriority(item, index) : undefined;
        if (isNumber(priority) && priority > 0)
            menuIndex = index;

        content.push(<OverflowItem key={props.getKey(item, index)} id={props.getKey(item, index)}
            priority={priority}>
            {props.renderItem(item, index)}
        </OverflowItem>);
    });

    addMenu();

    return (
        <Overflow minimumVisible={2} padding={60} key={`overflow_${props.items.length}`}>
            <div style={{ overflow: "hidden" }} className={props.className}>
                {
                    props.groupWrapper
                        ? props.groupWrapper(content)
                        : content
                }
            </div>
        </Overflow>
    )
};