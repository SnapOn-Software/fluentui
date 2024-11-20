import { useEffect } from 'react';
import { ConnectDragSource, DragSourceMonitor, useDrag } from 'react-dnd';
import { useDragDropContextInternal } from './drag-drop-context';

export interface iDraggedItemType<DragType extends string> {
    type: DragType;
}
export interface iDraggableProps<ItemType extends iDraggedItemType<string>> {
    item: ItemType;
    onBeginDrag?: () => void;
    onEndDrag?: (dropResult: any) => void;
}

export function useDraggable<ItemType extends iDraggedItemType<string>>(props?: iDraggableProps<ItemType>): {
    isDragging: boolean;
    dragRef: ConnectDragSource
} {
    const {
        item,
        onBeginDrag,
        onEndDrag,
    } = props || {
        item: {
            type: "~invalid~"
        }
    };

    const dragDropContext = useDragDropContextInternal();

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: item.type,
            item,
            collect: (monitor: DragSourceMonitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                dragDropContext.setDragItem(null);
                onEndDrag && onEndDrag(monitor.getDropResult());
            },
        }),
        [item, item.type]
    );

    useEffect(() => {
        if (isDragging) {
            dragDropContext.setDragItem(item);
            onBeginDrag && onBeginDrag();
        }
    }, [isDragging, onBeginDrag])

    return {
        isDragging,
        dragRef,
    };
}