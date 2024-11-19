import { Label, makeStyles } from "@fluentui/react-components";
import { ChevronRightRegular } from "@fluentui/react-icons";
import * as React from 'react';
import { Horizontal } from "./horizontal";
import { Vertical } from "./vertical";

const useStyles = makeStyles({
    opened: {
        transform: "rotate(90deg)",
        transition: "transform 200ms ease-out"
    },
    header: {
        cursor: "pointer"
    },
    root: {
        maxHeight: "100%"
    },
    body: {
        overflow: "auto"
    }
});

interface iProps {
    /** optionally, send the key for the group you want to open by default */
    opened?: string;
    groups: {
        key: string;
        title: string;
        icon?: JSX.Element;
        content: JSX.Element;
    }[];
}
export const AccordionEX: React.FunctionComponent<iProps> = (props) => {
    const classes = useStyles();
    const [opened, setOpened] = React.useState(props.opened || props.groups[0].key);
    return (<Vertical main css={[classes.root]}>
        {props.groups.map(group => <React.Fragment key={group.key}>
            <Horizontal css={[classes.header]} onClick={() => setOpened(group.key)}>
                <ChevronRightRegular className={opened === group.key && classes.opened} />
                <Label>{group.title}</Label>
            </Horizontal>
            {group.key === opened && <Vertical main css={[classes.body]}>
                {group.content}
            </Vertical>}
        </React.Fragment>)}
    </Vertical>
    );
}
