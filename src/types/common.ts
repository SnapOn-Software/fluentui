import { FluentIconsProps } from "@fluentui/react-icons";

/** FluentIcon definition changed, this covers both options */
export type FluentIconType = {
    (props: FluentIconsProps): JSX.Element;
    displayName?: string;
} | React.FC<FluentIconsProps>