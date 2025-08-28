import { Drawer, DrawerBody, DrawerHeader, drawerHeaderClassNames, DrawerHeaderProps, DrawerHeaderTitle, DrawerHeaderTitleProps, DrawerProps, makeStyles, tokens } from "@fluentui/react-components";
import { ReactNode } from "react";
import { useCommonStyles } from "../styles/styles";

const useStyles = makeStyles({
    drawer: {
        border: 0,
        [`&>.${drawerHeaderClassNames.root}`]: {
            boxShadow: tokens.shadow4Brand,
            backgroundColor: tokens.colorBrandBackground,
            color: tokens.colorNeutralBackground1,
            padding: tokens.spacingVerticalXL,
            '& button': {
                color: tokens.colorNeutralBackground1
            }

        }
    }
});

export default function DrawerEX(props: {
    rootProps?: DrawerProps;
    headerProps?: DrawerHeaderProps;
    headerTitleProps?: DrawerHeaderTitleProps;
    children?: ReactNode;
    title?: string;
    titleActions?: JSX.Element;
}) {
    const commonStyles = useCommonStyles();
    const css = useStyles();
    return <Drawer {...props.rootProps} className={css.drawer}>
        <DrawerHeader {...props.headerProps} className={commonStyles.header}>
            <DrawerHeaderTitle {...props.headerTitleProps} action={props.titleActions || props.headerTitleProps?.action}>
                {props.title || props.headerTitleProps?.children}
            </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
            {props.children}
        </DrawerBody>
    </Drawer>;
}