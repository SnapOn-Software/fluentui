import { Caption1, makeStyles, tokens } from "@fluentui/react-components";
import { DismissRegular, FluentIconsProps, ImageColor, ImageDismissRegular } from "@fluentui/react-icons";
import { shorthands } from "@griffel/react";
import { isNotEmptyString, isNullOrEmptyString } from "@kwiz/common";
import { useEffect, useState } from "react";
import { useFluentIcon, useFluentIconsList } from "../helpers/use-fluent-icon";
import { ButtonEXProps } from "../types";
import { ButtonEX } from "./button";
import { DrawerEX } from "./drawer-ex";
import { Horizontal } from "./horizontal";
import { Search } from "./search";
import { Vertical } from "./vertical";

const useStyles = makeStyles({
    icon: {
        width: '80px',
        padding: tokens.spacingHorizontalM,
        border: `${tokens.strokeWidthThin} solid transparent`,
        borderRadius: tokens.borderRadiusSmall,
        ':hover': {
            ...shorthands.borderColor(tokens.colorNeutralStroke1Hover)
        }
    },
    selected: {
        ...shorthands.borderColor(tokens.colorNeutralStroke1Selected)
    }
});

export function IconGallery({ value, onChange, searchable, withNone }: {
    value?: string;
    onChange: (icon?: string) => void;
    searchable?: boolean;
    /** show first item "none" */
    withNone?: boolean;
}) {
    const css = useStyles();
    const icons = useFluentIconsList();

    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!searchable) setSearch("");//in case caller set it to searchable, user searches, then they change it.
    }, [searchable]);

    return <Vertical main>
        {searchable && <Search value={search} onChangeDeferred={newValue => setSearch(newValue || "")} />}
        <Horizontal wrap main>
            {(withNone && isNullOrEmptyString(search)) && <Vertical centered css={[css.icon, isNullOrEmptyString(value) ? css.selected : '']}
                onClick={() => onChange()}>
                <ImageDismissRegular fontSize={tokens.fontSizeBase600} />
                <Caption1 style={{ textAlign: "center" }}>None</Caption1>
            </Vertical>}
            {(isNotEmptyString(search) ? icons.filter(icon => icon.name.toLowerCase().includes(search.toLowerCase())) : icons)
                .map(icon => <Vertical key={icon.name} centered css={[css.icon, icon.name === value ? css.selected : '']}
                    onClick={() => onChange(icon.name)}>
                    <DynamicIcon key={icon.name} name={icon.name} fontSize={tokens.fontSizeBase600} />
                    <Caption1 style={{ textAlign: "center" }}>{icon.title}</Caption1>
                </Vertical>)}
        </Horizontal>
    </Vertical>;
}
export function IconPicker({ value, onChange, extendButtonProps }: {
    value: string;
    onChange: (icon?: string) => void;
    extendButtonProps?: Partial<ButtonEXProps>;
}) {
    const [open, setOpen] = useState(false);
    return <>
        <ButtonEX icon={isNotEmptyString(value) ? <DynamicIcon name={value} /> : <ImageColor />} title="Pick an icon" showTitleWithIcon dontCenterText
            {...(extendButtonProps || {})}
            //after teh expand so they don't take over our onclick
            onClick={() => setOpen(true)} />
        {open && <DrawerEX title="Icon gallery" open size="large" titleActions={<ButtonEX icon={<DismissRegular />} title="Close" onClick={() => setOpen(false)} />}>
            <br />
            <IconGallery withNone searchable value={value} onChange={icon => {
                onChange(icon);
                setOpen(false)
            }} />
        </DrawerEX>}
    </>;
}
export default function DynamicIcon(props: { name?: string; } & FluentIconsProps) {
    const Icon = useFluentIcon(props?.name);
    return Icon ? <Icon {...(props || {})} /> : null;
}