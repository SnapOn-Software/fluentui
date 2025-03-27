import { Input, InputProps, makeStyles, mergeClasses } from '@fluentui/react-components';
import { DismissRegular, SearchRegular } from "@fluentui/react-icons";
import { debounce, isNullOrEmptyString, isNullOrUndefined } from '@kwiz/common';
import React, { useEffect, useRef } from 'react';
import { GetLogger } from '../_modules/config';
import { useEffectOnlyOnMount, useStateEX } from '../helpers';
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
    var notifyParent = React.useCallback(debounce(v => {
        logger.log(`Set: ${v}`);
        //Call the latest ref - we don't want to call an old version of this function
        refonChangeDeferred.current?.(v);
    }, delay * 1000), [delay]);

    const [currentValue, setCurrentValue] = useStateEX(props.value || props.defaultValue || "", { skipUpdateIfSame: true });
    useEffect(() => {
        if (!isNullOrUndefined(props.value))
            setCurrentValue(props.value);
    }, [props.value]);

    var changeValue = React.useCallback((newValue: string) => {
        newValue = newValue || "";//no null or undefined here
        setCurrentValue(newValue);//keep our state updated in sync
        props.onChange?.(newValue);//if parent is using search as managed control, keep it up to date in sync
        notifyParent(newValue);//trigger a search async
    }, useEffectOnlyOnMount);

    return (
        <Input {...props} autoFocus defaultValue={undefined} value={currentValue} onChange={(e, data) => {
            changeValue(data.value);
        }}
            className={mergeClasses(cssNames.root, props.main && cssNames.main)}
            contentBefore={!isNullOrEmptyString(currentValue) ? undefined : <SearchRegular className={cssNames.searchIcon} />}
            contentAfter={isNullOrEmptyString(currentValue)
                ? undefined
                : <DismissRegular className={cssNames.clickable} onClick={() => {
                    changeValue("");
                }} />
            } />
    );
}