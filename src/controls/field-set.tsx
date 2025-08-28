import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import React, { ReactNode } from "react";
import { Horizontal } from "./horizontal";

const useStyles = makeStyles({
    fieldset: {
        borderRadius: tokens.borderRadiusMedium,
        ...shorthands.borderColor(tokens.colorNeutralStrokeSubtle)
    },
    horizontal: {
        alignItems: "start"
    }
});

export const FieldSet = React.forwardRef<HTMLFieldSetElement, (React.PropsWithChildren<{ title: string; }>)>(({ title, children }, ref) => {
    const css = useStyles();

    return <fieldset ref={ref} className={css.fieldset}>
        <legend>{title}</legend>
        {children}
    </fieldset>;
});
export const HorizontalFieldSet = React.forwardRef<HTMLFieldSetElement, (React.PropsWithChildren<{ title: string; }>)>(({ title, children }, ref) => {
    const css = useStyles();

    return <FieldSet title={title}>
        <Horizontal wrap css={[css.horizontal]}>
            {children}
        </Horizontal>
    </FieldSet>;
});