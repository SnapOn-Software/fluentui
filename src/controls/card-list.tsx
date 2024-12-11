import { makeStyles } from '@fluentui/react-components';
import React from 'react';
import { CardEX, iCardProps } from './card';
import { Centered } from './centered';
import { Horizontal } from './horizontal';

const useStyles = makeStyles({
    emptyList: {
        position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
        display: "flex",
        zIndex: -1
    }
});
interface iProps {
    cards: iCardProps[];
    /** centered back-fill control */
    backfill?: JSX.Element;
}
export const CardList: React.FunctionComponent<React.PropsWithChildren<iProps>> = (props) => {
    const classes = useStyles();
    return (
        <Horizontal main wrap>
            {props.backfill && <div className={classes.emptyList}>
                <Centered>
                    {props.backfill}
                </Centered>
            </div>}

            {props.cards.map((card, idx) => <CardEX key={`i${idx}`} {...card} />)}
        </Horizontal>
    );
}