import { Drawer, DrawerBody, DrawerBodyProps, DrawerHeader, DrawerHeaderProps, DrawerHeaderTitle, DrawerHeaderTitleProps, DrawerProps, InlineDrawerProps, makeStyles, mergeClasses, OverlayDrawerProps } from "@fluentui/react-components";
import React from "react";
import { useCommonStyles } from "../styles/styles";

const useStyles = makeStyles({
    drawer: {
        border: 0,
    },
    heading: {
        //when using KWIZOverflowV2 in title
        overflow: "hidden",
        flexGrow: 1
    }
});

interface iProps {
    headerProps?: DrawerHeaderProps;
    headerTitleProps?: DrawerHeaderTitleProps;
    bodyProps?: DrawerBodyProps;
    title?: string | JSX.Element;
    titleActions?: JSX.Element;
}
type tProps = iProps & Omit<DrawerProps & (OverlayDrawerProps | InlineDrawerProps), "title">;
export const DrawerEX = React.forwardRef<HTMLDivElement, (React.PropsWithChildren<tProps>)>((props, ref) => {
    const commonStyles = useCommonStyles();
    const css = useStyles();
    const rootProps: DrawerProps = {
        ...props,
        title: "",
        as: props.as
    };

    return <Drawer ref={ref} {...rootProps}
        className={mergeClasses(rootProps.className, css.drawer)}>
        <DrawerHeader {...props.headerProps} className={commonStyles.header}>
            <DrawerHeaderTitle heading={{ className: css.heading }} {...props.headerTitleProps} action={props.titleActions || props.headerTitleProps?.action}>
                {props.title || props.headerTitleProps?.children}
            </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody {...props.bodyProps}>
            {props.children}
        </DrawerBody>
    </Drawer>;
});