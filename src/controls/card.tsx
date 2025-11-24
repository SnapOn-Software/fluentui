import { Card, CardFooter, cardFooterClassNames, CardHeader, CardPreview, InfoLabel, InfoLabelProps, Label, makeStyles, tokens } from '@fluentui/react-components';
import { MoreVerticalRegular } from '@fluentui/react-icons';
import { isNotEmptyArray, isNotEmptyString, isNullOrEmptyArray, isNullOrUndefined } from '@kwiz/common';
import React from 'react';
import { FluentIconType } from '../types/common';
import { iMenuItemEX, MenuEx } from './menu';

const useStyles = makeStyles({
    card: {
        height: '225px',
        width: '190px',
        [`& .${cardFooterClassNames.root}>button`]: {
            display: "none"
        },
        "&:hover": {
            backgroundColor: tokens.colorNeutralBackground1Hover,
            [`& .${cardFooterClassNames.root}>button`]: {
                display: "block"
            }
        }
    },
    previewContent: {
        textAlign: "center",
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorBrandBackground2
    },
    previewContentNoDescription: {
        textAlign: "center",
        color: tokens.colorBrandBackground,
        paddingTop: '20%'
    },
    cardIcon: {
        height: '120px',
        width: '100px'

    },
    cardLabels: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: '166px'
    },
})

export interface iCardProps {
    title: string;
    titleInfo?: InfoLabelProps['info'];
    description?: string;
    icon: FluentIconType;
    menuItems?: iMenuItemEX[];
    footer?: JSX.Element;
    onClick: React.MouseEventHandler<HTMLDivElement>;
}
export const CardEX: React.FunctionComponent<React.PropsWithChildren<iCardProps>> = (props) => {
    const classes = useStyles();
    const hasDescription = isNotEmptyString(props.description);
    const hasActions = isNotEmptyArray(props.menuItems) || !isNullOrUndefined(props.footer);
    return (
        <Card className={classes.card} onClick={props.onClick}>
            <CardPreview>
                <div className={hasDescription ? classes.previewContent : classes.previewContentNoDescription}>
                    <props.icon className={classes.cardIcon} />
                    {!hasDescription && <>
                        <br />
                        <Label>{props.title}</Label>
                    </>}
                </div>
            </CardPreview>
            {hasDescription && <CardHeader
                header={isNullOrUndefined(props.titleInfo)
                    ? <Label className={classes.cardLabels}>{props.title}</Label>
                    : <InfoLabel className={classes.cardLabels} info={props.titleInfo}>{props.title}</InfoLabel>}
                description={<Label className={classes.cardLabels} size='small'>{props.description}</Label>}
            />}
            {hasActions && <CardFooter action={isNullOrEmptyArray(props.menuItems)
                ? undefined
                : <MenuEx trigger={{ title: 'more', icon: <MoreVerticalRegular /> }}
                    items={props.menuItems} />}>
                {props.footer}
            </CardFooter>}
        </Card>);
}