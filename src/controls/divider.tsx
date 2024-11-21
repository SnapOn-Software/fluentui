import { Divider, DividerProps, makeStyles } from '@fluentui/react-components';
import React from 'react';

const useStyles = makeStyles({
    separator: {
        flexGrow: 0
    }
});
interface IProps extends DividerProps {
}
export const DividerEX = React.forwardRef<HTMLDivElement, (React.PropsWithChildren<IProps>)>((props, ref) => {
    const cssNames = useStyles();
    return (
        <Divider ref={ref} {...props} className={cssNames.separator} />
    );
});