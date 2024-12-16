export interface iDraggedItemType<DragType extends string> {
    type: DragType;
}
export interface iDraggableProps<ItemType extends iDraggedItemType<string>> {
    item: ItemType;
    onBeginDrag?: () => void;
    onEndDrag?: (dropResult: any) => void;
}

export interface iDroppableProps<DropTypes extends string, ItemTypes extends iDraggedItemType<DropTypes>> {
    acceptTypes: DropTypes[];
    onItemDrop: (item: ItemTypes) => void;
    onHover?: (item: ItemTypes) => void;
    onDrop?: () => void;
}

export interface iDragDropContext {
    isDragging: boolean;
    dragItem: iDraggedItemType<string>;
    setDragItem: (value: iDraggedItemType<string>) => void;
}
