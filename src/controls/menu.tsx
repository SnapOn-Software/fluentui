import { Menu, MenuButtonProps, MenuDivider, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuListProps, MenuPopover, menuPopoverClassNames, MenuPopoverProps, MenuProps, MenuTrigger, SplitButton, SplitButtonProps } from '@fluentui/react-components';
import { IDictionary, isNotEmptyArray, isNotEmptyString, isNullOrEmptyString, isNullOrUndefined, isNumber, isString, isUndefined, jsonClone, stopEvent } from '@kwiz/common';
import React from 'react';
import { useClickableDiv, useStateEX } from '../helpers';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { ButtonEX, ButtonEXProps } from './button';
import { DividerEX } from './divider';
import { Horizontal } from './horizontal';
import { Search } from './search';

interface iMenuItemEXItem {
    type?: "item";
    title: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: JSX.Element;
    items?: iMenuItemEX[];
    checked?: boolean;
    /** render this control instead of the item */
    as?: JSX.Element;
}
interface iMenuItemEXSeparator {
    type: "separator";
}
interface iMenuItemEXGroup {
    type: "group";
    title: string;
    //can't nest groups
    items: (iMenuItemEX & { type?: "separator" | "item" })[];
}
export type iMenuItemEX = iMenuItemEXItem | iMenuItemEXSeparator | iMenuItemEXGroup;

interface IPropsBase {
    menuProps?: MenuProps;
    menuPopOverProps?: MenuPopoverProps;
    menuListProps?: MenuListProps;
    items: iMenuItemEX[];
    /** default 8 null/false to disable */
    filterThreshold?: number | false;
    /** default 8, null/false to disable */
    pageSize?: number | false;
}
interface IPropsNoSplit {
    trigger: JSX.Element | string | ButtonEXProps;
    SplitButton?: false;
}
interface IPropsSplit {
    trigger: JSX.Element;
    /** send to to render trigger element as primary action on a split button. Only works with trigger as JSX.Element for primary button */
    SplitButton: true;
    SplitButtonProps?: SplitButtonProps;
}
export type iMenuExProps = IPropsBase & (IPropsNoSplit | IPropsSplit);
export const MenuEx: React.FunctionComponent<React.PropsWithChildren<iMenuExProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const [startIndexPerLevel, setStartIndexPerLevel] = useStateEX<IDictionary<number>>({});
    const [filterPerLevel, setFilterPerLevel] = useStateEX<IDictionary<string>>({});
    let pageSize: number = isUndefined(props.pageSize) ? 8 : isNumber(props.pageSize) ? props.pageSize : 99999999999;
    let filterThreshold: number = isUndefined(props.filterThreshold) ? 8 : isNumber(props.filterThreshold) ? props.filterThreshold : 99999999999;

    //when hovering over sub menu the parent would close - have menu trigger keep open on the parent level
    const [keepOpen, setKeepOpen] = useStateEX<IDictionary<boolean>>({});
    const [opened, setOpened] = useStateEX<IDictionary<boolean>>({});

    const clickableDiv = useClickableDiv();

    React.useEffect(() => {
        window.setTimeout(() => {
            var menus = document.querySelectorAll(`.${menuPopoverClassNames.root}`);
            menus.forEach((menu: HTMLDivElement) => {
                var rect = menu.getBoundingClientRect();
                if (rect.bottom > document.documentElement.clientHeight) {
                    menu.style.overflow = "auto";
                    menu.style.height = `${rect.height - (rect.bottom - document.documentElement.clientHeight)}px`;
                }
            });
        }, 100);
    }, [opened]);

    function renderItems(items: iMenuItemEX[], level: number) {
        const myLevelFilter = filterPerLevel[level];

        const showItem = (i: iMenuItemEX) => {
            //get rid of empty/null items
            let show = !isNullOrUndefined(i) && (isNotEmptyString(i.type) || isNotEmptyString((i as iMenuItemEXItem).title));
            if (show && isNotEmptyString(myLevelFilter)) {
                if (i.type === "separator") show = false;
                else if (i.type === "group") {
                    //only show group if 1 or more results are in it
                    return i.items.filter(sub => showItem(sub)).length > 0;
                }
                else
                    show = i.title.toLowerCase().indexOf(myLevelFilter) >= 0;
            }
            return show;
        }

        //inject group items into this level - so we share the filter/next functionality. it looks wierd if filter/paging is done per group if they are displayed inline.
        items = items.map(i => i.type === "group" && isNotEmptyArray(i.items) ? [i, ...i.items] : i)
            .flat()
            //filter empty item or based on text filter
            .filter(i => showItem(i));

        let menuItems = items.map((item, index) => {
            switch (item.type) {
                case "group":
                    //todo: technically group items should be nested inside the group for better screen reder support
                    return <MenuGroup key={index}>
                        <MenuGroupHeader>{item.title}</MenuGroupHeader>
                    </MenuGroup>;
                case "separator":
                    return <MenuDivider key={index} />;
                case "item":
                default:
                    const openKey = `${level}|${index}`;
                    if (item.as) return item.as;
                    const menuItem = <MenuItem key={index} icon={item.icon}
                        disabled={item.disabled}
                        onClick={item.onClick}
                    >{item.title}</MenuItem>;
                    return isNotEmptyArray(item.items)
                        ? <Menu key={index} mountNode={ctx.mountNode} open={opened[openKey] || false} onOpenChange={(e, data) => {
                            if (data.open) {
                                setOpened({ ...opened, [openKey]: true });
                                setKeepOpen({ ...keepOpen, [level]: true });
                            }
                            else if (!keepOpen[openKey]) {
                                setOpened({ ...opened, [openKey]: false });
                                setKeepOpen({ ...keepOpen, [level]: false });
                            }
                        }}>
                            <MenuTrigger disableButtonEnhancement>
                                {menuItem}
                            </MenuTrigger>
                            <MenuPopover>
                                <MenuList>
                                    {renderItems(item.items, level + 1)}
                                </MenuList>
                            </MenuPopover>
                        </Menu>
                        : menuItem;
            }
        });

        const paged = menuItems.length > pageSize;
        const filtered = menuItems.length > filterThreshold || !isNullOrEmptyString(myLevelFilter);

        if (paged) {
            let start = startIndexPerLevel[level];
            if (isNullOrUndefined(start)) start = 0;
            let hasMore = menuItems.length > start + pageSize;
            menuItems = menuItems.slice(start, start + pageSize);
            if (start > 0) {
                menuItems.splice(0, 0, <DividerEX key="$prev" title='Previous'
                    {...clickableDiv}
                    onClick={() => {
                        const s = jsonClone(startIndexPerLevel);
                        s[level] = start - pageSize;
                        setStartIndexPerLevel(s);
                    }}
                >previous</DividerEX>);
            }
            if (hasMore)
                menuItems.push(<DividerEX key="$next" title='Next'
                    {...clickableDiv}
                    onClick={() => {
                        const s = jsonClone(startIndexPerLevel);
                        s[level] = start + pageSize;
                        setStartIndexPerLevel(s);
                    }}
                >next</DividerEX>);
        }
        if (filtered) {
            //just filter - no paging
            menuItems.splice(0, 0, <Horizontal key='$search'>
                <Search defaultValue={myLevelFilter || ""} onChangeDeferred={(newValue) => {
                    const s = jsonClone(filterPerLevel);
                    s[level] = newValue ? newValue.toLowerCase() : "";
                    setFilterPerLevel(s);
                }} />
            </Horizontal>);
        }
        return menuItems;
    }

    return (
        <Menu mountNode={ctx.mountNode} {...props.menuProps} open={opened[0] || false} onOpenChange={(e, data) => {
            if (data.open) setOpened({ ...opened, 0: true });
            else if (!keepOpen[0]) setOpened({ ...opened, 0: false });
        }}>
            <MenuTrigger disableButtonEnhancement>
                {props.SplitButton === true
                    ? (triggerProps: MenuButtonProps) => <SplitButton
                        {...props.SplitButtonProps}
                        menuButton={triggerProps}
                        primaryActionButton={props.trigger}
                    />
                    : isString(props.trigger)
                        ? <ButtonEX title={props.trigger} onClick={(e) => {
                            stopEvent(e);
                        }} />
                        : isString((props.trigger as ButtonEXProps).title)
                            ? <ButtonEX {...(props.trigger as ButtonEXProps)} onClick={(e) => {
                                stopEvent(e);
                            }} />
                            : props.trigger as JSX.Element}
            </MenuTrigger>
            <MenuPopover {...props.menuPopOverProps}>
                <MenuList {...props.menuListProps}>
                    {renderItems(props.items, 0)}
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}