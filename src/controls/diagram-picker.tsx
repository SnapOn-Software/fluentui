import { Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, makeStyles, shorthands, Switch, tokens } from '@fluentui/react-components';
import { ImageSparkleRegular } from '@fluentui/react-icons';
import { DiagramOptions, stockUrl } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { useStateEX } from '../helpers';
import { ButtonEXPrimarySubtle } from './button';
import { Horizontal } from './horizontal';
import { Section } from './section';

const useStyles = makeStyles({
    dialog: {
        maxWidth: '70vw',
        width: '70vw',
    },
    dialogBody: {
        maxHeight: '60vh',
    },
    diagramWrapper: {
        justifyContent: "center",
        alignContent: "center"
    },
    diagram: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        padding: tokens.spacingHorizontalS,
        "&:hover": {
            ...shorthands.borderColor(tokens.colorBrandBackground),
        },
        "&>img": {
            width: "180px"
        },
    },
});

interface iProps {
    onSelect?: (diagram: { url: string; name: string; }) => void;
    onSelectBase64?: (diagram: string) => void;
    trigger?: JSX.Element;
    hiRes?: boolean;
    onlyTransparent?: boolean;
}
export const DiagramPicker = React.forwardRef<HTMLDivElement, (React.PropsWithChildren<iProps>)>((props, ref) => {
    const ctx = useKWIZFluentContext();
    const classes = useStyles();
    const [isOpen, setIsOpen] = useStateEX(false);
    const [hiRes, setHiRes] = useStateEX(props.hiRes);
    let options = (hiRes ? DiagramOptions.hiRes : DiagramOptions.options);
    if (props.onlyTransparent) options = options.filter(o => o.name.endsWith(', transparent'));
    return (
        <Dialog open={isOpen} onOpenChange={(e, data) => {
            setIsOpen(data.open);
        }}>
            <DialogTrigger disableButtonEnhancement>
                {props.trigger || <ButtonEXPrimarySubtle icon={<ImageSparkleRegular />} title='Open gallery' showTitleWithIcon dontCenterText />}
            </DialogTrigger>
            <DialogSurface mountNode={ctx.mountNode} className={classes.dialog}>
                <DialogBody className={classes.dialogBody}>
                    <DialogTitle>Choose a diagram</DialogTitle>
                    <DialogContent>
                        <Switch checked={hiRes === true}
                            onChange={(e, data) => {
                                setHiRes(data.checked === true);
                            }}
                            label="High resolution diagrams"
                        />
                        <Horizontal main wrap css={[classes.diagramWrapper]}>
                            {options
                                .map(diagram => <Section key={diagram.name} css={[classes.diagram]}
                                    title={diagram.name}
                                    onClick={async () => {
                                        const fullUrl = `${stockUrl}/${diagram.url}`;
                                        props.onSelect?.({ name: diagram.name, url: fullUrl });
                                        if (props.onSelectBase64) {
                                            const result = await fetch(fullUrl);
                                            const blob = await result.blob();
                                            const reader = new FileReader();
                                            reader.onload = function () {
                                                props.onSelectBase64?.(reader.result as string);
                                            };
                                            reader.readAsDataURL(blob);
                                        }
                                        setIsOpen(false);
                                    }}>
                                    <img src={`${stockUrl}/${diagram.url}`} />
                                </Section>)}
                        </Horizontal>
                    </DialogContent>
                    {/* <DialogActions>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Cancel</Button>
                        </DialogTrigger>
                        <Button appearance="primary">Save</Button>
                    </DialogActions> */}
                </DialogBody>
            </DialogSurface>
        </Dialog>);
}); 