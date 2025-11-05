import { Tab, TabList, TabListProps, TabProps } from "@fluentui/react-components";
import { CommonLogger, firstOrNull, isUndefined } from "@kwiz/common";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { IStackProps, Stack } from "./stack";

const logger = new CommonLogger("Tabs");

interface iProps<keyType extends string> {
    tabs: { key: keyType; title: string | JSX.Element; children: ReactNode | JSX.Element; props?: TabProps }[];
    root?: TabListProps;
    onSelect?: (value: keyType) => void;
    /** default: {direction:"v"} */
    container: IStackProps;
}

type tProps<keyType extends string> = iProps<keyType> & ({
    selected: keyType;
    defaultSelected?: never;

} | {
    selected?: never;
    defaultSelected: keyType;
});
export function TabsEX<keyType extends string>(props: tProps<keyType>) {
    const [isUnControlled, setIsUnControlled] = useState(!isUndefined(props.defaultSelected));

    const __isUnControlled = !isUndefined(props.defaultSelected);
    useEffect(() => {
        if (__isUnControlled !== isUnControlled) {
            logger.error(`A TabsEX control was switched from controlled to uncontrolled mode. This is not supported.`);
            setIsUnControlled(__isUnControlled);
            if (!__isUnControlled) {
                setUncontrolledSelected(props.selected);
            }
        }
    }, [__isUnControlled, isUnControlled]);

    const [uncontrolledSelected, setUncontrolledSelected] = useState(isUnControlled ? props.defaultSelected : props.selected);

    const selectedValueToUse = isUnControlled ? uncontrolledSelected : props.selected;

    const selectedTab = useMemo(() => {
        return firstOrNull(props.tabs, t => t.key === selectedValueToUse);
    }, [props.tabs, selectedValueToUse]);

    return <Stack {...props.container || { direction: "v" }}>
        <TabList {...props.root} selectedValue={selectedValueToUse} onTabSelect={(e, data) => {
            setUncontrolledSelected(data.value as keyType);
            props.onSelect?.(data.value as keyType);
        }}>
            {props.tabs.map(t => <Tab key={t.key} value={t.key}>{t.title}</Tab>)}
        </TabList>
        {selectedTab?.children}
    </Stack>;
}
