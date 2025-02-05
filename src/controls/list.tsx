import { makeStyles, tokens } from '@fluentui/react-components';
import { LOGO_BLUE_SQUARE, LOGO_WHITE_SQUARE, isNullOrUndefined, isString } from '@kwiz/common';
import React from 'react';
import { useKWIZFluentContext } from '../helpers/context-internal';
import { KnownClassNames, mixins } from '../styles/styles';
import { Horizontal } from './horizontal';
import { Section } from './section';
import { Vertical } from './vertical';

const useStyles = makeStyles({
    list: {
        rowGap: 0
    },
    listItem: {
        padding: tokens.spacingVerticalS,
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover
        }
    },
    listItemSelected: {
        backgroundColor: tokens.colorNeutralBackground1Selected
    },
    media: {
        width: '32px',
        fontSize: tokens.fontSizeBase600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    image: {
        width: tokens.lineHeightBase600,
        height: tokens.lineHeightBase600,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        borderRadius: tokens.borderRadiusCircular,
        border: `1px solid ${tokens.colorNeutralStroke1}`
    },
    listItemBody: {
        rowGap: 0,
        width: 'calc(100% - 44px)'
    },
    listItemHeader: mixins.ellipsis,
    listItemContent: {
        ...mixins.ellipsis,
        fontSize: tokens.fontSizeBase200
    },
    listItemMedia: {
        ...mixins.ellipsis,
        maxWidth: '20%',
        '& svg': {
            height: tokens.fontSizeBase300
        },
        '& button': {
            padding: 0,
            minWidth: 0,
            minHeight: 0,
            height: '14px'
        }
    },
    listItemMediaNoTrim: {
        overflow: 'visible',
        maxWidth: 'fit-content'
    },
    listItemMultilineContent: {
        whiteSpace: 'pre-line'
    }
});

export interface iListItem {
    key: string | number;
    media?: JSX.Element | string;
    header: string;
    headerMedia?: JSX.Element | string;
    content?: string | JSX.Element | (string | JSX.Element)[];
    onClickOnMedia?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    selected?: boolean;
}
interface IProps {
    selectable?: boolean;
    items: iListItem[];
    showAllHeaderMedia?: boolean;
    /** allow multiline content */
    multiline?: boolean;
    dark?: boolean;
}

export const ListEx = (props: IProps) => {
    const ctx = useKWIZFluentContext();
    const cssNames = useStyles();
    const isDark = ctx.dark === true || props.dark === true;

    const listItemElm = (item: iListItem) => <Horizontal key={item.key} css={[cssNames.listItem, item.selected && cssNames.listItemSelected]} onClick={item.onClick}>
        {item.media && <Section css={[cssNames.media]} onClick={(e) => {
            if (!item.onClickOnMedia)
                e.stopPropagation();//media may have its on onclick
        }}>{
                isString(item.media)
                    ? <div className={cssNames.image} style={{ backgroundImage: `url('${encodeURI(item.media)}'), url('${isDark ? LOGO_WHITE_SQUARE : LOGO_BLUE_SQUARE}')` }}></div>
                    : item.media
            }</Section>}
        <Vertical main css={[cssNames.listItemBody]}>
            <Horizontal main>
                <Section main css={[cssNames.listItemHeader]}>{item.header}</Section>
                {item.headerMedia && <Section onClick={(e) => {
                    e.stopPropagation();//media may have its on onclick
                }} css={[cssNames.listItemMedia, props.showAllHeaderMedia && cssNames.listItemMediaNoTrim]}>{item.headerMedia}</Section>}
            </Horizontal>
            {!isNullOrUndefined(item.content)
                ? (Array.isArray(item.content) ? item.content : [item.content]).map((c, idx) => isNullOrUndefined(c) ? undefined : <Section key={idx} css={[cssNames.listItemContent, props.multiline ? cssNames.listItemMultilineContent : undefined]}>{c}</Section>)
                : undefined}
        </Vertical>
    </Horizontal>;

    return (
        <Vertical css={[cssNames.list, KnownClassNames.list]}>
            {props.items.map(item => listItemElm(item))}
        </Vertical>
    );
}