import { createTableColumn, makeStyles, Table, TableBody, TableCell, TableCellActions, TableCellLayout, TableColumnDefinition, TableColumnId, TableHeader, TableHeaderCell, TableRow, TableSelectionCell, tokens, useArrowNavigationGroup, useTableFeatures, useTableSort } from "@fluentui/react-components";
import { CheckboxCheckedRegular, CheckboxUncheckedRegular, ChevronCircleLeftFilled, ChevronCircleLeftRegular, ChevronCircleRightFilled, ChevronCircleRightRegular, EqualCircleFilled, EqualCircleRegular, FilterDismissRegular, FilterFilled, FilterRegular, MoreVerticalRegular } from "@fluentui/react-icons";
import { CommonLogger, dateFormat, filterEmptyEntries, firstOrNull, IDictionary, isBoolean, isDate, isFunction, isNotEmptyArray, isNotEmptyString, isNullOrEmptyString, isNullOrNaN, isNullOrUndefined, isNumber, isPrimitiveValue, isString, primitiveTypes, stopEvent } from "@kwiz/common";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useShowOnHover } from "../helpers";
import { mergeClassesEX } from "../styles/styles";
import { ButtonEX } from "./button";
import { DatePickerEx } from "./date";
import { Horizontal } from "./horizontal";
import { InputEx, InputNumberEx } from "./input";
import { iMenuItemEX, MenuEx } from "./menu";

const logger = new CommonLogger("table");

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

interface iPropsBaseNoSelect {
    selectionMode?: never;
    getItemKey?: never;
    selection?: never;
    onSelect?: never;
}
interface iPropsSelect<ItemType extends itemTypeBase, ItemKeyType extends string | number> {
    selectionMode: "single" | "multiselect";
    /** used to identify the selected row */
    getItemKey: (item: ItemType) => ItemKeyType;
    selection: ItemKeyType[];
    onSelect: (selection: ItemKeyType[]) => void;
}

interface iPropsBase<ItemType extends itemTypeBase, FolderType extends IDictionary<tableItemValueType>> {
    columns: colType[];
    /** item is a dictionary. Values are primitives, or tableItemExpandedValueType */
    items: ItemType[];
    /** folders are similar to items but do not sort, always show on top, and hidden when there is a filter */
    folders?: FolderType[];
    css?: string[];
    rowCss?: string[];
    getItemMenu?: (item: ItemType, index: number) => iMenuItemEX[];
    getFolderMenu?: (folder: FolderType, index: number) => iMenuItemEX[];
}

interface iPropsUnfreezed<ItemType extends itemTypeBase, ItemKeyType extends string | number, FolderType extends IDictionary<tableItemValueType>> extends iPropsBase<ItemType, FolderType> {
    maxHeight: never;
}
interface iPropsFreezed<ItemType extends itemTypeBase, ItemKeyType extends string | number, FolderType extends IDictionary<tableItemValueType>> extends iPropsBase<ItemType, FolderType> {
    stickyTop?: true;
    stickyLeft?: true | 1 | 2;
    /** default: small - keep 40px of first cell visible. medium=80px cover=none */
    stickyLeftGap?: "small" | "medium" | "cover";
    /** if you want to have sticky header, with internal scroll - you must pass a max-height, for example:
     * 100% or calc(100vh - 16px)
     */
    maxHeight?: string;
}
type iProps<ItemType extends itemTypeBase, ItemKeyType extends string | number, FolderType extends IDictionary<tableItemValueType>> =
    iPropsUnfreezed<ItemType, ItemKeyType, FolderType> & iPropsSelect<ItemType, ItemKeyType> |
    iPropsFreezed<ItemType, ItemKeyType, FolderType> & iPropsSelect<ItemType, ItemKeyType> |
    iPropsUnfreezed<ItemType, ItemKeyType, FolderType> & iPropsBaseNoSelect |
    iPropsFreezed<ItemType, ItemKeyType, FolderType> & iPropsBaseNoSelect;

const cssNames = {
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

        },
        //make sure content covers the selection cell when it is not showing
        [`&.${cssNames.selectableTable}::before`]: {
            content: '""',
            position: "absolute",
            backgroundColor: tokens.colorNeutralBackground1,
            width: "40px",
            top: 0, left: '-40px', bottom: 0
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
    first2THWhenSticky: {
        zIndex: 30
    },
    table: {
        tableLayout: "auto"
    },
    nowrap: {
        whiteSpace: "nowrap"
    }
});

export function TableEX<ItemType extends itemTypeBase, ItemKeyType extends string | number, FolderType extends IDictionary<tableItemValueType> = {}>(props: iProps<ItemType, ItemKeyType, FolderType>) {
    const { items, columns, getItemMenu, selectionMode, folders, getFolderMenu } = props;
    const css = useStyles();
    const showOnHover = useShowOnHover();

    const fProps = props as iPropsFreezed<ItemType, ItemKeyType, FolderType>;
    const freezed = fProps.stickyTop || fProps.stickyLeft || isString(props.maxHeight);

    const keyboardNavAttr = useArrowNavigationGroup({ axis: "grid" });

    const normalizedCols: expandedColType[] = useMemo(() => columns.map(c => isString(c) ? {
        key: c,
        renderer: c,
        sortable: true,
    } : { ...c, renderer: c.renderer || c.key }), [columns]);

    // #region Styles
    const secondCellClass = fProps.stickyLeftGap === "cover" ? css.secondCellCover : fProps.stickyLeftGap === "medium" ? css.secondCellMedium : css.secondCellSmall;
    const headerCellClasses = fProps.stickyTop ? [css.th, showOnHover.hoverParent] : [showOnHover.hoverParent];
    const firstHeaderCellClasses: string[] = headerCellClasses.slice();
    const secondHeaderCellClasses: string[] = headerCellClasses.slice();
    const firstCellClasses: string[] = fProps.stickyLeft ? [css.firstCell] : [];
    const secondCellClasses: string[] = fProps.stickyLeft === 2 ? [secondCellClass] : [];
    const selectionCellHeaderClasses: string[] = [css.stickySelectionHeaderCell];
    const selectionCellClasses: string[] = [];
    if (fProps.stickyLeft) {
        firstHeaderCellClasses.splice(0, 0, css.firstCell);
        firstHeaderCellClasses.push(css.first2THWhenSticky);
        if (fProps.stickyLeft === 2) {
            secondHeaderCellClasses.splice(0, 0, secondCellClass);
            secondHeaderCellClasses.push(css.first2THWhenSticky);
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

    const menuIndex = fProps.stickyLeft === 2 ? 1 : 0;
    const hasMenu = useMemo(() => isFunction(getItemMenu), [getItemMenu]);
    const hasFolderMenu = useMemo(() => isFunction(getFolderMenu), [getItemMenu]);

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
        as: <Horizontal hSpaced key="filterMenuItemOperator">
            <ButtonEX icon={filterop === "lt" ? <ChevronCircleLeftFilled /> : <ChevronCircleLeftRegular />} title="Less than" onClick={(e) => { stopEvent(e); setFilterop("lt"); }} />
            <ButtonEX icon={filterop === "eq" ? <EqualCircleFilled /> : <EqualCircleRegular />} title="Equals" onClick={(e) => { stopEvent(e); setFilterop("eq"); }} />
            <ButtonEX icon={filterop === "gt" ? <ChevronCircleRightFilled /> : <ChevronCircleRightRegular />} title="Greater than" onClick={(e) => { stopEvent(e); setFilterop("gt"); }} />
        </Horizontal>
    }), [filterop]);
    // #endregion

    // #region Sort
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

    // #selection
    const { onSelect, selection, getItemKey } = { selection: [], ...props as iPropsSelect<ItemType, ItemKeyType> };
    const allSelected = selection.length === rows.length;
    const toggleRow = useCallback((item: ItemType) => {
        if (isNotEmptyString(selectionMode)) {
            const key = getItemKey(item);
            if (!isNullOrUndefined(key)) {
                if (!selection.includes(key)) {
                    if (selectionMode === "multiselect")
                        onSelect([...selection, key]);//add
                    else
                        onSelect([key]);//change - select one
                }
                else//selected
                {
                    if (selectionMode === "multiselect")//remove selected
                    {
                        onSelect(selection.filter(s => s !== key));
                    }
                }
            }
        }
    }, [selection, onSelect, selectionMode]);
    // #endregion

    const tbl = <Table className={mergeClassesEX(css.table, props.css)}
        {...keyboardNavAttr}>
        <TableHeader>
            <TableRow>
                {isNotEmptyString(selectionMode) && <TableSelectionCell type="checkbox" className={mergeClassesEX(selectionCellClasses, selectionCellHeaderClasses)}
                    checked={
                        allSelected ? true : selection.length > 0 ? "mixed" : false
                    }
                    onClick={selectionMode === "multiselect"
                        ? () => onSelect(filterEmptyEntries(allSelected ? [] : rows.map(r => getItemKey(r.item)))) : undefined}
                    onKeyDown={selectionMode === "multiselect"
                        ? (e: React.KeyboardEvent) => {
                            if (e.key === " ") {
                                stopEvent(e);
                                onSelect(filterEmptyEntries(allSelected ? [] : rows.map(r => getItemKey(r.item))));
                            }
                        } : undefined}
                />}
                {normalizedCols.map((col, coli) => <TableHeaderCell key={`h${coli}`} className={mergeClassesEX((coli === 0 ? firstHeaderCellClasses : coli === 1 ? secondHeaderCellClasses : headerCellClasses), col.headerCss, col.nowrap ? css.nowrap : undefined)}
                    {...(col.sortable ? headerSortProps(col.key) : {})}>
                    {isString(col.renderer) ? col.renderer : col.renderer()}
                    {col.filter
                        ? <MenuEx trigger={{
                            icon: col.key === filter?.column ? <FilterFilled /> : <FilterRegular />,
                            title: "Filtering", className: col.key === filter?.column ? '' : showOnHover.showOnHover
                        }}
                            items={[...(col.filter === "string"
                                ? [
                                    { title: "Filter text", onClick: () => { }, as: <InputEx key="filterInput" value={filter?.value as string || ""} onClick={e => stopEvent(e)} onChange={(e, data) => setFilter(isNullOrEmptyString(data.value) ? null : { column: col.key, value: data.value })} /> },
                                ]
                                : col.filter === "number"
                                    ? [
                                        { title: "Filter number", onClick: () => { }, as: <InputNumberEx key="filterInput" defaultValue={filter?.value as number} onClick={e => stopEvent(e)} onChange={(num) => setFilter(isNullOrNaN(num) ? null : { column: col.key, value: num })} /> },
                                        filterMenuItemOperator
                                    ]
                                    : col.filter === "bool"
                                        ? [
                                            { title: "On", icon: <CheckboxCheckedRegular />, onClick: (e) => { stopEvent(e); setFilter({ column: col.key, value: true }); } },
                                            { title: "Off", icon: <CheckboxUncheckedRegular />, onClick: (e) => { stopEvent(e); setFilter({ column: col.key, value: false }); } }
                                        ]
                                        : col.filter === "date"
                                            ? [
                                                {
                                                    title: "Filter date", onClick: () => { }, as: <DatePickerEx key="filterInput" value={filter?.value as Date} onDateChange={date => {
                                                        //console.log(date);
                                                        setFilter(!isDate(date) ? null : { column: col.key, value: date });
                                                    }} />
                                                },
                                                filterMenuItemOperator
                                            ]
                                            : []),
                            { title: "Clear filter", icon: <FilterDismissRegular />, onClick: (e) => { stopEvent(e); setFilter(null); } },
                            ]} />
                        : undefined}
                </TableHeaderCell>)}
            </TableRow>
        </TableHeader>
        <TableBody>
            {(!filter && isNotEmptyArray(folders)) ? folders.map((folder, folderIndex) => <TableRow key={`f${folderIndex}`} className={mergeClassesEX(props.rowCss)}>
                {isNotEmptyString(selectionMode) && <td />}
                {normalizedCols.map((col, coli) => {
                    const normalizedColValue = normalizeColValue(folder[col.key]);
                    const menuItems = (hasFolderMenu && menuIndex === coli) ? getFolderMenu(folder, folderIndex) : [];
                    return <TableCell key={`h${coli}`} tabIndex={0} role="gridcell" className={mergeClassesEX((coli === 0 ? firstCellClasses : coli === 1 ? secondCellClasses : []), col.css, col.nowrap ? css.nowrap : undefined)}>
                        <TableCellLayout media={normalizedColValue.media} appearance={col.primary ? "primary" : undefined} description={normalizedColValue.description}>{isFunction(normalizedColValue.renderer) ? normalizedColValue.renderer() : normalizedColValue.renderer}</TableCellLayout>
                        {(isNotEmptyArray(menuItems)) && <TableCellActions>
                            <MenuEx trigger={{ icon: <MoreVerticalRegular />, title: "more" }} items={menuItems} />
                        </TableCellActions>}
                    </TableCell>;
                })}
            </TableRow>) : undefined}
            {rows.map((row, rowi) => <TableRow key={`i${rowi}`} className={mergeClassesEX(props.rowCss)}
                onClick={(e: React.MouseEvent) => toggleRow(row.item)}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === " ") {
                        stopEvent(e);
                        toggleRow(row.item);
                    }
                }}
            >
                {isNotEmptyString(selectionMode) && <TableSelectionCell subtle
                    className={mergeClassesEX(selectionCellClasses)}
                    checked={selection.includes(getItemKey(row.item))}
                    type={selectionMode === "single" ? "radio" : "checkbox"}
                    radioIndicator={{ "aria-label": "Select row" }}
                />}
                {normalizedCols.map((col, coli) => {
                    const normalizedColValue = normalizeColValue(row.item[col.key]);

                    const menuItems = (hasMenu && menuIndex === coli) ? getItemMenu(row.item, rowi) : [];
                    return <TableCell key={`h${coli}`} tabIndex={0} role="gridcell" className={mergeClassesEX((coli === 0 ? firstCellClasses : coli === 1 ? secondCellClasses : []), col.css, col.nowrap ? css.nowrap : undefined)}>
                        <TableCellLayout media={normalizedColValue.media} appearance={col.primary ? "primary" : undefined} description={normalizedColValue.description}>{isFunction(normalizedColValue.renderer) ? normalizedColValue.renderer() : normalizedColValue.renderer}</TableCellLayout>
                        {isNotEmptyArray(menuItems) && <TableCellActions>
                            <MenuEx trigger={{ icon: <MoreVerticalRegular />, title: "more" }} items={menuItems} />
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