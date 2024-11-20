import { Divider, DividerProps, makeStyles } from '@fluentui/react-components';
import React from 'react';

const useStyles = makeStyles({
    separator: {
        flexGrow: 0
    }
});
interface IProps extends DividerProps {
}
export const DividerEX: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const cssNames = useStyles();
    return (
        <Divider {...props} className={cssNames.separator} />
    );
}