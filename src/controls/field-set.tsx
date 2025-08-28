import { makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { ReactNode } from "react";
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

export function FieldSet({ title, children }: { title: string; children: ReactNode }) {
    const css = useStyles();

    return <fieldset className={css.fieldset}>
        <legend>{title}</legend>
        {children}
    </fieldset>;
}
export function HorizontalFieldSet({ title, children }: { title: string; children: ReactNode }) {
    const css = useStyles();

    return <FieldSet title={title}>
        <Horizontal wrap css={[css.horizontal]}>
            {children}
        </Horizontal>
    </FieldSet>;
}