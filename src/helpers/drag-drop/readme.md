Use drag drop with types examples:

Wrap everything within drag/drop context:
```tsx
<DragDropContextProvider>
...
</DragDropContextProvider>
```

Define the types you want to allow drag/drop:
```tsx
export type dragColumnType = "column";
export type dragCellType = "cell";
export interface dragColumn extends iDraggedItemType<dragColumnType> {
    data: iDesignerContextFields
}

export interface dragCell extends iDraggedItemType<dragCellType> {
    row: number;
    cell: number;
}
export interface dropCellOrColumn extends iDroppableProps<dragColumnType | dragCellType, dragColumn | dragCell> {
}
```

use within a control:
```tsx
    const { drag, drop, dragDropRef } = useDragDropContext<
        dragCell, dropCellOrColumn
    >({
        dragInfo: {
            item: {
                type: "cell",
                cell: props.index,
                row: props.rowIndex
            },
        },
        dropInfo: {
            acceptTypes: ["cell", "column"],
            onItemDrop: item => {
                switch (item.type) {
                    case "cell":
                        alert(item.cell);
                        break;
                    case "column":
                        alert(item.data.title);
                        break;
                }
            }
        }
    });

...

<Section css={[
        drop.isOver && classes.hover,
        drag.isDragging && classes.dragging
        ]}
        ref={dragDropRef}>
        ...
</Section>
```

Use with a wrapper:

```tsx
<DragDropContainer<dragColumn>
    dragInfo={{
        item: {
            type: "column",
            data: f
        }
    }}>
<ButtonEX  ... />
</DragDropContainer>
```