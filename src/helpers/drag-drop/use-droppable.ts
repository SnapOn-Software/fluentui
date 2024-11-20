import { ConnectDropTarget, DropTargetMonitor, useDrop } from 'react-dnd';
import { iDraggedItemType } from './use-draggable';

export interface iDroppableProps<DropTypes extends string, ItemTypes extends iDraggedItemType<DropTypes>> {
    acceptTypes: DropTypes[];
    onItemDrop: (item: ItemTypes) => void;
    onHover?: (item: ItemTypes) => void;
    onDrop?: () => void;
}

function useDroppable<DropType extends string, ItemType extends iDraggedItemType<DropType>>(props?: iDroppableProps<DropType, ItemType>): {
    canDrop: boolean;
    isOver: boolean;
    dropRef: ConnectDropTarget;
} {
    const {
        acceptTypes,
        onItemDrop,
        onHover,
        onDrop,
    } = props || {
        acceptTypes: [],
        onItemDrop: () => { }
    };

    const [{ canDrop, isOver }, dropRef] = useDrop({
        accept: acceptTypes,
        drop: (item: ItemType) => {
            onItemDrop(item);
            onDrop?.();
        },
        hover: (item: ItemType) => {
            onHover?.(item);
        },
        collect: (monitor: DropTargetMonitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    });

    return {
        canDrop,
        isOver,
        dropRef,
    };
}

export default useDroppable;