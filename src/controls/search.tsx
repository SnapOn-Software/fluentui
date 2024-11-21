import { Input, InputProps, makeStyles } from '@fluentui/react-components';
import { DismissRegular, SearchRegular } from "@fluentui/react-icons";
import { debounce, isFunction, isNullOrEmptyString, isUndefined } from '@kwiz/common';
import React, { useState } from 'react';
import { GetLogger } from '../_modules/config';
import { useStateEX } from '../helpers/hooks';
import { mixins } from '../styles/styles';
const logger = GetLogger("Search");

const useStyles = makeStyles({
    main: mixins.main,
    clickable: mixins.clickable,
})

interface IProps extends InputProps {
    main?: boolean;
    delay?: number;
    /** if changing the value in the caller - change this prop to reset */
    resetValue?: string;
    onChangeDeferred?: (newValue: string) => void;
    onChangeSync?: (newValue: string) => void;
}

/** value is set on first load. to change the value after it was first set - change the compoenet's key. */
export const Search: React.FunctionComponent<React.PropsWithChildren<IProps>> = (props) => {
    const cssNames = useStyles();

    const [resetKey, setResetKey] = useState(1);

    let delay = props.delay || 1;

    //cannot call debounce every render, since it won't be the same debounced instance...
    var notifyParent = React.useMemo(() => debounce(v => {
        logger.log(`Set: ${v}`);
        props.onChangeDeferred(v);
    }, delay * 1000), [delay]);

    let [value, setValue] = useStateEX(props.value || "", {
        onChange: newValue => {
            if (isFunction(props.onChangeSync)) props.onChangeSync(newValue as string);
            if (isFunction(props.onChangeDeferred)) notifyParent(newValue);
            return newValue;
        }
    });

    //once props change, reset this control value to match
    React.useEffect(() => {
        if (!isUndefined(props.resetValue))
            setValue(props.resetValue);
        //todo: bug: setting value does not sync into the text box
        setResetKey(resetKey + 1)
    }, [props.resetValue]);

    return (
        <Input key={resetKey} {...props} value={value} onChange={(e, data) => setValue(data.value)}
            className={props.main ? cssNames.main : undefined}
            contentBefore={!isNullOrEmptyString(value) ? undefined : <SearchRegular />}
            contentAfter={isNullOrEmptyString(value)
                ? undefined
                : <DismissRegular className={cssNames.clickable} onClick={() => {
                    setValue("");
                    //todo: bug: setting value does not sync into the text box
                    setResetKey(resetKey + 1)
                }} />
            } />
    );
}