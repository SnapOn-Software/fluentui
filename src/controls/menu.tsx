import { Menu, MenuDivider, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuListProps, MenuPopover, menuPopoverClassNames, MenuPopoverProps, MenuProps, MenuTrigger } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { IDictionary, isNotEmptyArray, isNotEmptyString, isNullOrEmptyString, isNullOrUndefined, isNumber, isString, isUndefined, jsonClone, stopEvent } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { useStateEX } from '../helpers';
import { ButtonEX, ButtonEXProps } from './button';
import { Horizontal } from './horizontal';
import { Search } from './search';
import { Section } from './section';

interface iMenuItemEXItem {
    type?: "item";
    title: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: JSX.Element;
    items?: iMenuItemEX[];
    checked?: boolean;
}
interface iMenuItemEXSeparator {
    type: "separator";
}
interface iMenuItemEXGroup {
    type: "group";
    title: string;
    items: iMenuItemEX[];
}
export type iMenuItemEX = iMenuItemEXItem | iMenuItemEXSeparator | iMenuItemEXGroup;

interface IProps {
    menuProps?: MenuProps;
    menuPopOverProps?: MenuPopoverProps;
    menuListProps?: MenuListProps;
    trigger: JSX.Element | string | ButtonEXProps;
    items: iMenuItemEX[];
    /** default 8 null/false to disable */
    filterThreshold?: number | false;
    /** default 8, null/false to disable */
    pageSize?: number | false;
}
export const MenuEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const [startIndexPerLevel, setStartIndexPerLevel] = useStateEX<IDictionary<number>>({});
    const [filterPerLevel, setFilterPerLevel] = useStateEX<IDictionary<string>>({});
    let pageSize: number = isUndefined(props.pageSize) ? 8 : isNumber(props.pageSize) ? props.pageSize : 99999999999;
    let filterThreshold: number = isUndefined(props.filterThreshold) ? 8 : isNumber(props.filterThreshold) ? props.filterThreshold : 99999999999;

    //when hovering over sub menu the parent would close - have menu trigger keep open on the parent level
    const [keepOpen, setKeepOpen] = useStateEX<IDictionary<boolean>>({});
    const [opened, setOpened] = useStateEX<IDictionary<boolean>>({});

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
        //get rid of empty/null items
        items = items.filter(i => !isNullOrUndefined(i) && (isNotEmptyString(i.type) || isNotEmptyString((i as iMenuItemEXItem).title)))
        if (isNotEmptyString(myLevelFilter)) {
            items = items.filter(i => i.type !== "separator" && i.title.toLowerCase().indexOf(myLevelFilter) >= 0);
        }

        let menuItems = items.map((item, index) => {
            switch (item.type) {
                case "group":
                    return <MenuGroup key={index}>
                        <MenuGroupHeader>{item.title}</MenuGroupHeader>
                        {renderItems(item.items, level + 1)}
                    </MenuGroup>;
                case "separator":
                    return <MenuDivider key={index} />;
                case "item":
                default:
                    const openKey = `${level}|${index}`;
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
        const filterControl = filtered && <Search value={myLevelFilter || ""} onChangeDeferred={(newValue) => {
            const s = jsonClone(filterPerLevel);
            s[level] = newValue ? newValue.toLowerCase() : "";
            setFilterPerLevel(s);
        }} />;
        if (paged) {
            let start = startIndexPerLevel[level];
            if (isNullOrUndefined(start)) start = 0;
            let hasMore = menuItems.length > start + pageSize;
            menuItems = menuItems.slice(start, start + pageSize);
            if (start > 0 || hasMore) menuItems.splice(0, 0, <Horizontal key='$next'>
                <ButtonEX disabled={start < 1} icon={<ChevronLeftRegular />} title='previous' onClick={() => {
                    const s = jsonClone(startIndexPerLevel);
                    s[level] = start - pageSize;
                    setStartIndexPerLevel(s);
                }} />
                <Section main>
                    {filterControl}
                </Section>
                <ButtonEX disabled={!hasMore} icon={<ChevronRightRegular />} title='next' onClick={() => {
                    const s = jsonClone(startIndexPerLevel);
                    s[level] = start + pageSize;
                    setStartIndexPerLevel(s);
                }} />
            </Horizontal>);
        }
        else if (filtered) {
            //just filter - no paging
            menuItems.splice(0, 0, <Horizontal key='$next'>
                {filterControl}
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
                {isString(props.trigger)
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