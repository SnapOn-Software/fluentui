import { Drawer, DrawerBody, DrawerHeader, DrawerHeaderTitle, Field, Label, makeStyles, Radio, tokens } from '@fluentui/react-components';
import { DismissRegular, SaveRegular } from '@fluentui/react-icons';
import { isNullOrUndefined, waitFor } from '@kwiz/common';
import { DefaultDarkColors, DefaultLightColors, MisMerge2 } from '@mismerge/react';
import * as React from 'react';

import '@mismerge/core/dark.css';
import '@mismerge/core/styles.css';
import { useStateEX, useWindowSize } from '../helpers';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { ButtonEX, ButtonEXPrimarySubtle } from './button';
import { Horizontal } from './horizontal';
import { Section } from './section';
import { Vertical } from './vertical';

const useStyles = makeStyles({
    root: {
        // position: 'fixed',
        // top: 0,
        // left: 0,
        // right: 0,
        // bottom: 0,
        // backgroundColor: tokens.colorNeutralBackground1,
        // zIndex: 10,
        "& .mismerge": {
            // height: "100%",
            "--background": tokens.colorNeutralBackground1,
            //line number background
            "--primary-100": tokens.colorNeutralBackground2,
            //selection background
            "--selection": tokens.colorNeutralBackground1Selected,
            //scrollbar hover
            "--primary-300": tokens.colorNeutralBackground1Hover,
            //border / scroll
            "--primary-200": tokens.colorNeutralStroke1,
            //line number color
            "--primary-400": tokens.colorNeutralForeground2,
            //button hover color
            "--primary-500": tokens.colorNeutralForeground1Hover,
            //main text color
            "--primary-600": tokens.colorNeutralForeground1,
            "& TEXTAREA": {
                lineHeight: "20px"
            }
        }
    },
    menu: {
        justifyContent: "space-between"
    }
});

interface IProps {
    title: string;
    description?: string;
    lhsTitle: string;
    lhsValue: string;
    rhsTitle: string;
    rhsValue: string;
    dark?: boolean;
    save: (merged: string) => void;
    cancel: () => void;
}
export const MergeText: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const classes = useStyles();
    const ctx = useKWIZFluentContext();

    let size = useWindowSize();
    let wrapper = React.useRef<HTMLDivElement>();
    let [lhs, setLhs] = useStateEX(props.lhsValue || "", {
        skipUpdateIfSame: true, onChange: (v, changed) => {
            if (changed) setKeep("left"); return v;
        }
    });
    let [rhs, setRhs] = useStateEX(props.rhsValue || "", {
        skipUpdateIfSame: true, onChange: (v, changed) => {
            if (changed) setKeep("right"); return v;
        }
    });
    let [keep, setKeep] = useStateEX<"cancel" | "left" | "right">("cancel");

    React.useEffect(() => {
        if (wrapper.current) {
            waitFor(() => !isNullOrUndefined(wrapper.current.querySelector(".mismerge"))).then(() => {
                let mismerge = wrapper.current.querySelector(".mismerge") as HTMLDivElement;
                if (mismerge)
                    mismerge.style.height = `${mismerge.offsetParent.clientHeight - mismerge.offsetTop - 10}px`;
            });
        }
    }, [wrapper.current, size.height]);

    return <Drawer type='overlay' open size='full' className={classes.root} mountNode={ctx.mountNode}>
        <DrawerHeader>
            <DrawerHeaderTitle action={<ButtonEX icon={<DismissRegular />} title="Close" onClick={props.cancel} />}>
                {props.title}
            </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody>
            <Vertical>
                {props.description && <Label>{props.description}</Label>}
                <Field label="Which version would you like to keep?"
                    hint="Merge the changes to either side and save. Close this panel to keep editing the page without saving">
                    <Horizontal css={[classes.menu]}>
                        <Horizontal nogap>
                            <Radio value="left" label={props.lhsTitle} checked={keep === "left"} onClick={() => setKeep("left")} />
                            <ButtonEXPrimarySubtle showTitleWithIcon dontCenterText icon={<SaveRegular />} disabled={keep !== "left"} title={`Save ${props.lhsTitle.toLowerCase()}`} onClick={() => props.save(lhs)} />
                        </Horizontal>
                        <Horizontal nogap>
                            <Radio value="right" label={props.rhsTitle} checked={keep === "right"} onClick={() => setKeep("right")} />
                            <ButtonEXPrimarySubtle showTitleWithIcon dontCenterText icon={<SaveRegular />} disabled={keep !== "right"} title={`Save ${props.rhsTitle.toLowerCase()}`} onClick={() => props.save(rhs)} />
                        </Horizontal>
                    </Horizontal>
                </Field>
                <Section main ref={wrapper}>
                    <MisMerge2
                        lhs={lhs}
                        rhs={rhs}
                        lhsEditable rhsEditable
                        onLhsChange={v => setLhs(v)}
                        onRhsChange={v => setRhs(v)}
                        colors={props.dark ? DefaultDarkColors : DefaultLightColors}
                    />
                </Section>
            </Vertical>
        </DrawerBody>
    </Drawer>;
}
