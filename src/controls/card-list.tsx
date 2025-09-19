import { makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';
import { KnownClassNames } from '../styles';
import { CardEX, iCardProps } from './card';
import { Centered } from './centered';
import { Horizontal } from './horizontal';
import { iOverflowV2Props, KWIZOverflowV2 } from './kwizoverflow2';

const useStyles = makeStyles({
    backfill: {
        position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
        display: "flex",
        zIndex: -1
    },
    rootStyle: {
        position: "relative",
        zIndex: 0
    },
    overflowStyle: {
        padding: tokens.spacingHorizontalXXS
    }
});
interface iProps {
    cards: iCardProps[];
    /** centered back-fill control */
    backfill?: JSX.Element;
    /** single line fit, when overflow - more button will trigger this handler */
    useOverflow?: boolean;
    renderOverflowMenuButton?: (props: iOverflowV2Props<iCardProps>) => JSX.Element;
}
export const CardList: React.FunctionComponent<React.PropsWithChildren<iProps>> = (props) => {
    const classes = useStyles();
    return (!props.useOverflow
        ? <Horizontal main wrap css={[KnownClassNames.cardList, classes.rootStyle]}>
            {props.backfill && <div className={classes.backfill}>
                <Centered>
                    {props.backfill}
                </Centered>
            </div>}

            {props.cards.map((card, idx) => <CardEX key={`i${idx}`} {...card} />)}
        </Horizontal>
        : <KWIZOverflowV2 root={{ css: [classes.rootStyle, classes.overflowStyle] }}
            items={props.cards}
            renderItem={(card) => <CardEX  {...card} />}
            renderOverflowMenuButton={props.renderOverflowMenuButton}
        >{props.backfill && <div className={classes.backfill}>
            <Centered>
                {props.backfill}
            </Centered>
        </div>}</KWIZOverflowV2>
    );
}