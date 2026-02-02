import { makeStyles, mergeClasses, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, tokens } from "@fluentui/react-components";
import { CheckboxCheckedRegular, CheckboxUncheckedRegular, MoreVerticalRegular } from "@fluentui/react-icons";
import { filterEmptyEntries, IDictionary, isBoolean, isDate, isNotEmptyArray, isNotEmptyString, isNullOrUndefined, isNumber, isString } from "@kwiz/common";
import { ReactNode, useMemo } from "react";
import { Horizontal } from "./horizontal";
import { iMenuItemEX, MenuEx } from "./menu";

type colType = string | {
    /** key used for getting the column value, and for sorting/filtering */
    key: string;
    renderer?: string | (() => ReactNode);
    headerCss?: string[];
    css?: string[];
    nowrap?: boolean;
}
type itemType = IDictionary<string | number | Date | boolean | {
    raw?: object;
    valuForSort?: string | number | Date | boolean;
    renderer?: string | (() => ReactNode);
}>;
interface iPropsBase<ItemType extends itemType> {
    columns: colType[];
    /** item is a dictionary. Values are primitives, or {valueForSort:string;renderer:string|} */
    items: ItemType[];
    css?: string[];
    rowCss?: string[];
    getItemMenu?: (item: ItemType, index: number) => iMenuItemEX[];
}
interface iPropsUnfreezed<ItemType extends itemType> extends iPropsBase<ItemType> {
    maxHeight: never;
}
interface iPropsFreezed<ItemType extends itemType> extends iPropsBase<ItemType> {
    stickyTop?: true;
    stickyLeft?: true | 1 | 2;
    /** default: small - keep 40px of first cell visible. medium=80px cover=none */
    stickyLeftGap?: "small" | "medium" | "cover";
    /** if you want to have sticky header, with internal scroll - you must pass a max-height, for example:
     * 100% or calc(100vh - 16px)
     */
    maxHeight?: string;
}
type iProps<ItemType extends itemType> = iPropsUnfreezed<ItemType> | iPropsFreezed<ItemType>;

const useStyles = makeStyles({
    firstCell: {
        position: "sticky",
        left: 0,
        zIndex: 10,
        backgroundColor: "white"
    },
    secondCellCover: {
        position: "sticky",
        left: '0',
        zIndex: 10,
        backgroundColor: "white",
        maxWidth: '200px'
    },
    secondCellSmall: {
        position: "sticky",
        left: '40px',
        zIndex: 10,
        backgroundColor: "white",
        maxWidth: '200px'
    },
    secondCellMedium: {
        position: "sticky",
        left: '80px',
        zIndex: 10,
        backgroundColor: "white",
        maxWidth: '200px'
    },
    th: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "white",
        whiteSpace: "nowrap",
        '::after': {
            content: '""',
            position: "absolute",
            backgroundColor: tokens.colorNeutralStroke1,
            height: "1px",
            left: 0, right: 0, bottom: 0

        }
    },
    stickyColumnCell: {
        '::after': {
            content: '""',
            position: "absolute",
            backgroundColor: tokens.colorNeutralStroke1,
            width: "1px",
            top: 0, right: 0, bottom: 0

        }
    },
    stickyColumnCellPre: {
        '::before': {
            content: '""',
            position: "absolute",
            backgroundColor: tokens.colorNeutralStroke2,
            width: "1px",
            top: 0, left: 0, bottom: 0

        }
    },
    first2TH: {
        zIndex: 30
    },
    table: {
        tableLayout: "auto"
    },
    nowrap: {
        whiteSpace: "nowrap"
    },
    menuCell: {
        "& .row-menu": {
            visibility: "hidden",
        },
        ":hover .row-menu": {
            visibility: "visible"
        }
    }
});

export function TableEX<ItemType extends itemType>(props: iProps<ItemType>) {
    const css = useStyles();

    const fProps = props as iPropsFreezed<ItemType>;
    const freezed = fProps.stickyTop || fProps.stickyLeft || isString(props.maxHeight);

    const normalizedCols = useMemo(() => props.columns.map(c => isString(c) ? {
        key: c,
        renderer: c
    } : { ...c, renderer: c.renderer || c.key }), [props.columns]);

    const secondCellClass = fProps.stickyLeftGap === "cover" ? css.secondCellCover : fProps.stickyLeftGap === "medium" ? css.secondCellMedium : css.secondCellSmall;
    const headerCellClasses = fProps.stickyTop ? [css.th] : [];
    const firstHeaderCellClasses: string[] = headerCellClasses.slice();
    const secondHeaderCellClasses: string[] = headerCellClasses.slice();
    const firstCellClasses: string[] = fProps.stickyLeft ? [css.firstCell] : [];
    const secondCellClasses: string[] = fProps.stickyLeft === 2 ? [secondCellClass] : [];
    if (fProps.stickyLeft) {
        firstHeaderCellClasses.splice(0, 0, css.firstCell);
        firstHeaderCellClasses.push(css.first2TH);
        if (fProps.stickyLeft === 2) {
            secondHeaderCellClasses.splice(0, 0, secondCellClass);
            secondHeaderCellClasses.push(css.first2TH);
            secondCellClasses.push(css.stickyColumnCell);
            secondCellClasses.push(css.stickyColumnCellPre);
        }
        else
            firstCellClasses.push(css.stickyColumnCell);
    }

    const menuIndex = isNullOrUndefined(props.getItemMenu) ? -1 : fProps.stickyLeft === 2 ? 1 : 0;

    const tbl = <Table className={mergeClassesEX(css.table, props.css)}>
        <TableHeader>
            <TableRow>
                {normalizedCols.map((col, coli) => <TableHeaderCell key={`h${coli}`} className={mergeClassesEX((coli === 0 ? firstHeaderCellClasses : coli === 1 ? secondHeaderCellClasses : headerCellClasses), col.headerCss, col.nowrap ? css.nowrap : undefined)}>
                    {isString(col.renderer) ? col.renderer : col.renderer()}
                </TableHeaderCell>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {props.items.map((row, rowi) => <TableRow key={`i${rowi}`} className={mergeClassesEX(props.rowCss)}>
                {normalizedCols.map((col, coli) => {
                    const colValue = row[col.key];
                    const cellControl = isString(colValue) || isNumber(colValue)
                        ? colValue
                        : isBoolean(colValue) ? colValue ? <CheckboxCheckedRegular /> : <CheckboxUncheckedRegular />
                            : isDate(colValue)
                                ? colValue.toDateString()
                                : isString(colValue?.renderer) ? colValue?.renderer : colValue?.renderer();
                    return <TableCell key={`h${coli}`} className={mergeClassesEX((coli === 0 ? firstCellClasses : coli === 1 ? secondCellClasses : []), col.css, col.nowrap ? css.nowrap : undefined, menuIndex === coli ? css.menuCell : null)}>
                        {menuIndex === coli
                            ? <Horizontal>
                                {cellControl}
                                <MenuEx trigger={{ className: "row-menu", icon: <MoreVerticalRegular />, title: "more" }} items={props.getItemMenu(row, rowi)} />
                            </Horizontal>
                            : cellControl}
                    </TableCell>;
                })}
            </TableRow>)}
        </TableBody>
    </Table>;

    return freezed
        ? <div style={{ maxHeight: fProps.maxHeight, overflow: "auto" }}>{tbl}</div>
        : tbl;
}

/** calls mergeClasses handle string[] that might have multi class (split by space) elements */
export function mergeClassesEX(...css: (string | string[])[]) {
    const combined = filterEmptyEntries((css || []).flatMap(c =>
        isNotEmptyArray(c)
            ? c.flatMap(c2 => isNotEmptyString(c2)
                ? c2.split(" ") : [])
            : isNotEmptyString(c)
                ? c.split(" ")
                : []));

    return mergeClasses(...combined);
}