import { createTableColumn, makeStyles, Table, TableBody, TableCell, TableCellActions, TableCellLayout, TableColumnDefinition, TableColumnId, TableHeader, TableHeaderCell, TableRow, TableSelectionCell, tokens, useArrowNavigationGroup, useTableFeatures, useTableSelection, useTableSort } from "@fluentui/react-components";
import { CheckboxCheckedRegular, CheckboxUncheckedRegular, ChevronCircleLeftFilled, ChevronCircleLeftRegular, ChevronCircleRightFilled, ChevronCircleRightRegular, EqualCircleFilled, EqualCircleRegular, FilterDismissRegular, FilterFilled, FilterRegular, MoreVerticalRegular } from "@fluentui/react-icons";
import { dateFormat, firstOrNull, IDictionary, isBoolean, isDate, isFunction, isNotEmptyString, isNullOrEmptyString, isNullOrNaN, isNullOrUndefined, isNumber, isPrimitiveValue, isString, primitiveTypes, stopEvent } from "@kwiz/common";
import { ReactNode, useMemo, useState } from "react";
import { mergeClassesEX } from "../styles/styles";
import { ButtonEX } from "./button";
import { DatePickerEx } from "./date";
import { Horizontal } from "./horizontal";
import { InputEx, InputNumberEx } from "./input";
import { iMenuItemEX, MenuEx } from "./menu";

type expandedColType = {
    /** key used for getting the column value, and for sorting/filtering */
    key: string;
    renderer?: string | (() => ReactNode);
    headerCss?: string[];
    css?: string[];
    nowrap?: boolean;
    sortable?: boolean;
    /** should match the type of primitiveValue or tableItemValueType */
    filter?: "string" | "bool" | "number" | "date";
    primary?: boolean;
};
type colType = string | expandedColType;
export type tableItemExpandedValueType = {
    /** pass in any object you can access in your actions */
    raw?: object;
    /** if your renderer does not return a simple string, use this to provide a sort/filter value */
    primitiveValue?: primitiveTypes;
    renderer?: string | (() => ReactNode);
    media?: JSX.Element;
    description?: string;
}
export type tableItemValueType = primitiveTypes | tableItemExpandedValueType;
//function isItemExpandedValueType
type itemTypeBase = IDictionary<tableItemValueType>;
interface iPropsBase<ItemType extends itemTypeBase> {
    columns: colType[];
    /** item is a dictionary. Values are primitives, or tableItemExpandedValueType */
    items: ItemType[];
    css?: string[];
    rowCss?: string[];
    getItemMenu?: (item: ItemType, index: number) => iMenuItemEX[];
    selectionMode?: "single" | "multiselect";
    /* if you want to control the selected items - pass an array. otherwise it will be uncontrolled */
    selection?: number[];
    onSelectionChange?: (selected: number[]) => void;
}
interface iPropsUnfreezed<ItemType extends itemTypeBase> extends iPropsBase<ItemType> {
    maxHeight: never;
}
interface iPropsFreezed<ItemType extends itemTypeBase> extends iPropsBase<ItemType> {
    stickyTop?: true;
    stickyLeft?: true | 1 | 2;
    /** default: small - keep 40px of first cell visible. medium=80px cover=none */
    stickyLeftGap?: "small" | "medium" | "cover";
    /** if you want to have sticky header, with internal scroll - you must pass a max-height, for example:
     * 100% or calc(100vh - 16px)
     */
    maxHeight?: string;
}
type iProps<ItemType extends itemTypeBase> = iPropsUnfreezed<ItemType> | iPropsFreezed<ItemType>;


const cssNames = {
    showOnHover: "show-hover",
    sortIcon: "sort-icon",
    selectableTable: "selectable-table"
};
const selectionCellWidth = 32;
const backgroundFix = {
    backgroundColor: tokens.colorNeutralBackground1,
    ":hover": {
        color: tokens.colorNeutralForeground1Hover,
        backgroundColor: tokens.colorSubtleBackgroundHover
    }
};
const useStyles = makeStyles({
    stickySelectionCell: {
        position: "sticky",
        left: 0,
        top: 0,
        zIndex: 30,
        ...backgroundFix
    },
    stickySelectionHeaderCell: {
        zIndex: 40
    },
    singleSelect: {
        '&>*': { visibility: "hidden" }
    },
    firstCell: {
        position: "sticky",
        left: 0,
        zIndex: 10,
        ...backgroundFix,
        [`&.${cssNames.selectableTable}`]: {
            left: `${selectionCellWidth}px`
        }
    },
    secondCellCover: {
        position: "sticky",
        left: '0',
        zIndex: 10,
        maxWidth: '200px',
        ...backgroundFix,
        [`&.${cssNames.selectableTable}`]: {
            left: `${selectionCellWidth}px`
        }
    },
    secondCellSmall: {
        position: "sticky",
        left: '40px',
        zIndex: 10,
        maxWidth: '200px',
        ...backgroundFix,
        [`&.${cssNames.selectableTable}`]: {
            left: `${selectionCellWidth + 40}px`
        }
    },
    secondCellMedium: {
        position: "sticky",
        left: '80px',
        zIndex: 10,
        maxWidth: '200px',
        ...backgroundFix,
        [`&.${cssNames.selectableTable}`]: {
            left: `${selectionCellWidth + 80}px`
        }
    },
    th: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        whiteSpace: "nowrap",
        ...backgroundFix,
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
    //remove menu cell, rowmenu, repurpose for filter on hover
    hoverParent: {
        [`& .${cssNames.showOnHover}`]: {
            visibility: "hidden",
        },
        [`:hover .${cssNames.showOnHover}`]: {
            visibility: "visible"
        }
    }
});

export function TableEX<ItemType extends itemTypeBase>(props: iProps<ItemType>) {
    const { items, columns, getItemMenu, selectionMode, onSelectionChange, selection } = props;
    const css = useStyles();

    const fProps = props as iPropsFreezed<ItemType>;
    const freezed = fProps.stickyTop || fProps.stickyLeft || isString(props.maxHeight);

    const keyboardNavAttr = useArrowNavigationGroup({ axis: "grid" });

    const normalizedCols: expandedColType[] = useMemo(() => columns.map(c => isString(c) ? {
        key: c,
        renderer: c,
        sortable: true,
    } : { ...c, renderer: c.renderer || c.key }), [columns]);

    // #region Styles
    const secondCellClass = fProps.stickyLeftGap === "cover" ? css.secondCellCover : fProps.stickyLeftGap === "medium" ? css.secondCellMedium : css.secondCellSmall;
    const headerCellClasses = fProps.stickyTop ? [css.th, css.hoverParent] : [css.hoverParent];
    const firstHeaderCellClasses: string[] = headerCellClasses.slice();
    const secondHeaderCellClasses: string[] = headerCellClasses.slice();
    const firstCellClasses: string[] = fProps.stickyLeft ? [css.firstCell] : [];
    const secondCellClasses: string[] = fProps.stickyLeft === 2 ? [secondCellClass] : [];
    const selectionCellHeaderClasses: string[] = [css.stickySelectionHeaderCell];
    const selectionCellClasses: string[] = [];
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
    if (isNotEmptyString(selectionMode)) {
        selectionCellClasses.push(css.stickySelectionCell);
        if (selectionMode === "single")
            selectionCellHeaderClasses.push(css.singleSelect);
        firstCellClasses.push(cssNames.selectableTable);
        secondCellClasses.push(cssNames.selectableTable);
        firstHeaderCellClasses.push(cssNames.selectableTable);
        secondHeaderCellClasses.push(cssNames.selectableTable);
    }
    // #endregion

    const menuIndex = isNullOrUndefined(getItemMenu) ? -1 : fProps.stickyLeft === 2 ? 1 : 0;

    function normalizeColValue(colValue: tableItemValueType) {
        const normalizedColValue: tableItemExpandedValueType = isPrimitiveValue(colValue)
            ? {
                primitiveValue: colValue, renderer: isNumber(colValue)
                    ? colValue.toString(10)
                    : isDate(colValue)
                        ? colValue.toDateString()
                        : isBoolean(colValue)
                            ? () => (colValue
                                ? <CheckboxCheckedRegular />
                                : <CheckboxUncheckedRegular />)
                            : colValue
            }
            : colValue;
        return normalizedColValue;
    }

    function toPrimitiveValue(colValue: tableItemValueType) {
        if (isPrimitiveValue(colValue)) return colValue;
        else if (!isNullOrUndefined(colValue.primitiveValue))
            return colValue.primitiveValue;
        else if (isString(colValue.renderer))
            return colValue.renderer;
        else return null;
    }

    // #region Filter
    const [filter, setFilter] = useState<{ column: string; value: primitiveTypes; }>();
    const [filterop, setFilterop] = useState<"eq" | "gt" | "lt">("eq");
    const filteredItems: ItemType[] = useMemo(() => {
        if (!filter) return items;
        const filterCol = firstOrNull(normalizedCols, c => c.key === filter.column);
        if (!filterCol?.filter) return items;

        switch (filterCol.filter) {
            case "string": {
                const fValue = (filter.value as string).toLowerCase();
                return items.filter(i => {
                    const v = toPrimitiveValue(i[filterCol.key]);
                    if (isNotEmptyString(v))
                        return v.toLowerCase().includes(fValue);
                    else return false;
                });
            }
            case "bool": {
                const fValue = filter.value === true;
                return items.filter(i => {
                    const v = toPrimitiveValue(i[filterCol.key]);
                    if (fValue) return v === true;
                    else return v !== true;//false/null as false
                });
            }
            case "number": {
                const fValue = (filter.value as number);
                return items.filter(i => {
                    const v = toPrimitiveValue(i[filterCol.key]) as number;
                    if (isNullOrNaN(v)) return false;
                    if (filterop === "gt") return v >= fValue;
                    else if (filterop === "lt") return v <= fValue;
                    else return v === fValue;
                });
            }
            case "date": {
                const fValue = dateFormat(filter.value as Date, "yyyyMMdd");

                return items.filter(i => {
                    const v = (toPrimitiveValue(i[filterCol.key]) as Date);
                    if (!isDate(v)) return false;
                    const vFormat = dateFormat(v, "yyyyMMdd");
                    if (filterop === "gt") return vFormat >= fValue;
                    else if (filterop === "lt") return vFormat <= fValue;
                    else return vFormat === fValue;
                });
            }
        }
    }, [items, filter, normalizedCols, filterop]);
    const filterMenuItemOperator: iMenuItemEX = useMemo(() => ({
        title: "Op", onClick: () => { },
        as: <Horizontal hSpaced>
            <ButtonEX icon={filterop === "lt" ? <ChevronCircleLeftFilled /> : <ChevronCircleLeftRegular />} title="Less than" onClick={() => setFilterop("lt")} />
            <ButtonEX icon={filterop === "eq" ? <EqualCircleFilled /> : <EqualCircleRegular />} title="Equals" onClick={() => setFilterop("eq")} />
            <ButtonEX icon={filterop === "gt" ? <ChevronCircleRightFilled /> : <ChevronCircleRightRegular />} title="Greater than" onClick={() => setFilterop("gt")} />
        </Horizontal>
    }), [filterop]);
    // #endregion

    // #region Sort and Select
    const table_columns: TableColumnDefinition<ItemType>[] = useMemo(() => normalizedCols.map(col => createTableColumn<ItemType>({
        columnId: col.key,
        compare: (a, b) => {
            const var1 = toPrimitiveValue(a[col.key]);
            const var2 = toPrimitiveValue(b[col.key]);
            if (isNullOrUndefined(var1) && isNullOrUndefined(var2)) return 0;
            else if (isNullOrUndefined(var1)) return -1;
            else if (isNullOrUndefined(var2)) return 1;
            const var1x = isDate(var1) ? var1.getTime() : isBoolean(var1) ? var1 ? 1 : 0 : var1;
            const var2x = isDate(var2) ? var2.getTime() : isBoolean(var2) ? var2 ? 1 : 0 : var2;
            //both not null and must be same value type
            return isString(var1x)
                ? var1x.localeCompare(var2 as string)
                : var1x - (var2x as number);
        }
    })), [normalizedCols]);

    const table_features = useTableFeatures(
        { columns: table_columns, items: filteredItems },
        [
            useTableSort({
                defaultSortState: { sortColumn: normalizedCols[0].key, sortDirection: "ascending" }
            }),
            useTableSelection({
                selectionMode,
                selectedItems: selection,
                onSelectionChange: (e, data) => {
                    onSelectionChange?.([...data.selectedItems as Set<number>]);
                }
            })
        ]);

    const headerSortProps = (columnId: TableColumnId) => ({
        onClick: (e: React.MouseEvent) => {
            table_features.sort.toggleColumnSort(e, columnId);
        },
        sortDirection: table_features.sort.getSortDirection(columnId),
    });

    const rows = table_features.sort.sort(table_features.getRows());
    // #endregion

    const tbl = <Table className={mergeClassesEX(css.table, props.css)}
        {...keyboardNavAttr}>
        <TableHeader>
            <TableRow>
                {isNotEmptyString(selectionMode) && <TableSelectionCell type="checkbox" className={mergeClassesEX(selectionCellClasses, selectionCellHeaderClasses)}
                    checked={
                        table_features.selection.allRowsSelected ? true : table_features.selection.someRowsSelected ? "mixed" : false
                    }
                    onClick={selectionMode === "multiselect"
                        ? table_features.selection.toggleAllRows : undefined}
                    onKeyDown={selectionMode === "multiselect"
                        ? (e: React.KeyboardEvent) => {
                            if (e.key === " ") {
                                stopEvent(e);
                                table_features.selection.toggleAllRows(e);
                            }
                        } : undefined}
                />}
                {normalizedCols.map((col, coli) => <TableHeaderCell key={`h${coli}`} className={mergeClassesEX((coli === 0 ? firstHeaderCellClasses : coli === 1 ? secondHeaderCellClasses : headerCellClasses), col.headerCss, col.nowrap ? css.nowrap : undefined)}
                    {...(col.sortable ? headerSortProps(col.key) : {})}>
                    {isString(col.renderer) ? col.renderer : col.renderer()}
                    {col.filter
                        //stop event to stop triggering sort...
                        ? <div onClick={(e) => stopEvent(e)}>
                            <MenuEx trigger={{
                                icon: col.key === filter?.column ? <FilterFilled /> : <FilterRegular />,
                                title: "Filtering", className: col.key === filter?.column ? '' : cssNames.showOnHover
                            }}
                                items={[...(col.filter === "string"
                                    ? [
                                        { title: "Filter text", onClick: () => { }, as: <InputEx value={filter?.value as string || ""} onChange={(e, data) => setFilter(isNullOrEmptyString(data.value) ? null : { column: col.key, value: data.value })} /> },
                                    ]
                                    : col.filter === "number"
                                        ? [
                                            { title: "Filter number", onClick: () => { }, as: <InputNumberEx defaultValue={filter?.value as number} onChange={(num) => setFilter(isNullOrNaN(num) ? null : { column: col.key, value: num })} /> },
                                            filterMenuItemOperator
                                        ]
                                        : col.filter === "bool"
                                            ? [
                                                { title: "On", icon: <CheckboxCheckedRegular />, onClick: () => setFilter({ column: col.key, value: true }) },
                                                { title: "Off", icon: <CheckboxUncheckedRegular />, onClick: () => setFilter({ column: col.key, value: false }) }
                                            ]
                                            : col.filter === "date"
                                                ? [
                                                    {
                                                        title: "Filter date", onClick: () => { }, as: <DatePickerEx value={filter?.value as Date} onDateChange={date => {
                                                            console.log(date);
                                                            setFilter(!isDate(date) ? null : { column: col.key, value: date });
                                                        }} />
                                                    },
                                                    filterMenuItemOperator
                                                ]
                                                : []),
                                { title: "Clear filter", icon: <FilterDismissRegular />, onClick: () => { stopEvent(window.event); setFilter(null); } },
                                ]} /></div>
                        : undefined}
                </TableHeaderCell>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map((row, rowi) => <TableRow key={`i${rowi}`} className={mergeClassesEX(props.rowCss)}
                onClick={(e: React.MouseEvent) => table_features.selection.toggleRow(e, row.rowId)}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === " ") {
                        stopEvent(e);
                        table_features.selection.toggleRow(e, row.rowId)
                    }
                }}
            >
                {isNotEmptyString(selectionMode) && <TableSelectionCell
                    className={mergeClassesEX(selectionCellClasses)}
                    checked={table_features.selection.isRowSelected(row.rowId)}
                    type={selectionMode === "single" ? "radio" : "checkbox"}
                    radioIndicator={{ "aria-label": "Select row" }}
                />}
                {normalizedCols.map((col, coli) => {
                    const normalizedColValue = normalizeColValue(row.item[col.key]);
                    return <TableCell key={`h${coli}`} tabIndex={0} role="gridcell" className={mergeClassesEX((coli === 0 ? firstCellClasses : coli === 1 ? secondCellClasses : []), col.css, col.nowrap ? css.nowrap : undefined)}>
                        <TableCellLayout media={normalizedColValue.media} appearance={col.primary ? "primary" : undefined} description={normalizedColValue.description}>{isFunction(normalizedColValue.renderer) ? normalizedColValue.renderer() : normalizedColValue.renderer}</TableCellLayout>
                        {menuIndex === coli && <TableCellActions>
                            <MenuEx trigger={{ icon: <MoreVerticalRegular />, title: "more" }} items={getItemMenu(row.item, rowi)} />
                        </TableCellActions>}
                    </TableCell>;
                })}
            </TableRow>)}
        </TableBody>
    </Table >;

    return freezed
        ? <div style={{ maxHeight: fProps.maxHeight, overflow: "auto" }}>{tbl}</div>
        : tbl;
}