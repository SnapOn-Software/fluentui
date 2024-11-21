import { Menu, MenuDivider, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuListProps, MenuPopover, MenuPopoverProps, MenuProps, MenuTrigger } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { IDictionary, isNotEmptyArray, isNullOrEmptyString, isNullOrUndefined, isNumber, isString, isUndefined, jsonClone } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context';
import { useStateEX } from '../helpers/hooks';
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
    /** default 8 0/null to disable */
    filterThreshold?: number;
    /** default 8, 0/null to disable */
    pageSize?: number;
}
export const MenuEx: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const ctx = useKWIZFluentContext();
    const [startIndexPerLevel, setStartIndexPerLevel] = useStateEX<IDictionary<number>>({});
    const [filterPerLevel, setFilterPerLevel] = useStateEX<IDictionary<string>>({});
    let pageSize = isUndefined(props.pageSize) ? 8 : props.pageSize;
    let filterThreshold = isUndefined(props.filterThreshold) ? 8 : props.filterThreshold;
    if (!isNumber(pageSize)) pageSize = 99999999999;
    if (!isNumber(filterThreshold)) filterThreshold = 99999999999;

    function renderItems(items: iMenuItemEX[], level: number) {
        const myLevelFilter = filterPerLevel[level];
        if (!isNullOrEmptyString(myLevelFilter)) {
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
                    const menuItem = <MenuItem key={index} icon={item.icon}
                        disabled={item.disabled}
                        onClick={item.onClick}
                    >{item.title}</MenuItem>;
                    if (isNotEmptyArray(item.items)) {
                        <Menu key={index}>
                            <MenuTrigger disableButtonEnhancement>
                                {menuItem}
                            </MenuTrigger>
                            <MenuPopover>
                                <MenuList>
                                    {renderItems(item.items, level + 1)}
                                </MenuList>
                            </MenuPopover>
                        </Menu>
                    }
                    else return menuItem;
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
        <Menu mountNode={ctx.mountNode} {...props.menuProps}>
            <MenuTrigger disableButtonEnhancement>
                {isString(props.trigger)
                    ? <ButtonEX title={props.trigger} />
                    : isString((props.trigger as ButtonEXProps).title)
                        ? <ButtonEX {...(props.trigger as ButtonEXProps)} />
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