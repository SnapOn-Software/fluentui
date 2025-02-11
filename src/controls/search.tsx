import { Input, InputProps, makeStyles, mergeClasses } from '@fluentui/react-components';
import { DismissRegular, SearchRegular } from "@fluentui/react-icons";
import { debounce, isNullOrEmptyString } from '@kwiz/common';
import React, { useRef } from 'react';
import { GetLogger } from '../_modules/config';
import { mixins } from '../styles/styles';
const logger = GetLogger("Search");

const useStyles = makeStyles({
    main: mixins.main,
    clickable: mixins.clickable,
    root: {
    },
    searchIcon: {
    },
})

interface IProps extends Omit<InputProps, "onChange"> {
    main?: boolean;
    /** number of seconds to debounce the deferred event */
    delay?: number;
    /** if changing the value in the caller - change this prop to reset */
    resetValue?: string;
    onChangeDeferred?: (newValue: string) => void;
    onChange?: (newValue: string) => void;
}

/** value is set on first load. to change the value after it was first set - change the compoenet's key. */
export const Search: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const cssNames = useStyles();

    let delay = props.delay || 1;

    let refonChangeDeferred = useRef(props.onChangeDeferred);
    //keep updating the ref
    React.useEffect(() => { refonChangeDeferred.current = props.onChangeDeferred; }, [props.onChangeDeferred]);

    //cannot call debounce every render, since it won't be the same debounced instance...
    var notifyParent = React.useMemo(() => debounce(v => {
        logger.log(`Set: ${v}`);
        //Call the latest ref - we don't want to call an old version of this function
        refonChangeDeferred.current?.(v);
    }, delay * 1000), [delay]);

    const currentValue = props.value || "";

    return (
        <Input {...props} value={currentValue} onChange={(e, data) => {
            props.onChange?.(data.value);
            notifyParent(data.value);
        }}
            className={mergeClasses(cssNames.root, props.main && cssNames.main)}
            contentBefore={!isNullOrEmptyString(currentValue) ? undefined : <SearchRegular className={cssNames.searchIcon} />}
            contentAfter={isNullOrEmptyString(currentValue)
                ? undefined
                : <DismissRegular className={cssNames.clickable} onClick={() => {
                    props.onChange?.("");
                    notifyParent("");
                }} />
            } />
    );
}