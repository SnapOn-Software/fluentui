import { makeStyles, tokens } from "@fluentui/react-components";
import { ChevronRightRegular } from "@fluentui/react-icons";
import * as React from 'react';
import { KnownClassNames } from "../styles/styles";
import { ButtonEX } from "./button";
import { DividerEX } from "./divider";
import { Horizontal } from "./horizontal";
import { Section } from "./section";
import { Vertical } from "./vertical";

const useStyles = makeStyles({
    opened: {
        transform: "rotate(90deg)",
        transition: "transform 200ms ease-out"
    },
    header: {
        paddingLeft: 0
    },
    root: {
        maxHeight: "100%"
    },
    body: {
        overflow: "auto",
    },
    indent: {
        width: tokens.spacingHorizontalL
    }
});

interface iProps {
    /** optional: send the key for the group you want to open by default */
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
    return (<Vertical main css={[classes.root, KnownClassNames.accordion]}>
        {props.groups.map(group => <React.Fragment key={group.key}>
            <ButtonEX className={`${classes.header} ${KnownClassNames.accordionHeader} ${opened === group.key ? ` ${KnownClassNames.isOpen}` : ''}`}
                icon={<ChevronRightRegular className={opened === group.key ? classes.opened : ''} />}
                title={group.title} showTitleWithIcon dontCenterText
                onClick={() => setOpened(group.key)}
            />
            <DividerEX />
            {group.key === opened && <>
                <Horizontal main css={[classes.body, KnownClassNames.accordionBodyWrapper]}>
                    <Section css={[classes.indent, KnownClassNames.accordionBodyIndent]}></Section>
                    <Vertical main css={[KnownClassNames.accordionBody]}>
                        {group.content}
                    </Vertical>
                </Horizontal>
                <DividerEX />
            </>}
        </React.Fragment>)}
    </Vertical>
    );
}
