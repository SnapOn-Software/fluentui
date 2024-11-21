import { isNullOrUndefined } from "@kwiz/common";
import React, { useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStateEX } from "../hooks";
import { iDraggableProps, iDraggedItemType, useDraggable } from "./use-draggable";
import useDroppable, { iDroppableProps } from "./use-droppable";

export interface iDragDropContext {
    isDragging: boolean;
    dragItem: iDraggedItemType<string>;
    setDragItem: (value: iDraggedItemType<string>) => void;
}
//create context
export const DragDropContext = React.createContext<iDragDropContext>(null);
//use context from within controls
export function useDragDropContextInternal() {
    const dragDropContext = useContext(DragDropContext);
    return dragDropContext;
}
export function useDragDropContext<
    DragItemType extends iDraggedItemType<string> = never,
    DropInfoType extends iDroppableProps<string, any> = never
>(info: {
    dragInfo?: iDraggableProps<DragItemType>;
    dropInfo?: DropInfoType;
}) {
    const dragDropContext = useDragDropContextInternal();
    const isDraggable = !isNullOrUndefined(info.dragInfo);
    const isDroppable = !isNullOrUndefined(info.dropInfo);
    const drag = useDraggable(info?.dragInfo);
    const drop = useDroppable(info?.dropInfo);
    const expectingDrop = isDroppable && !drag.isDragging && dragDropContext.isDragging
        //check if item being dragged is allowed in this context...
        && info.dropInfo.acceptTypes.indexOf(dragDropContext.dragItem.type) >= 0;

    return {
        dragDropContext,
        drag,
        drop,
        /** an item that this control can handler is being dragged */
        expectingDrop,
        dragDropRef: isDraggable && !isDroppable
            ? drag.dragRef
            : !isDraggable && isDroppable
                ? drop.dropRef
                //both drag and drop allowed
                : expectingDrop ? drop.dropRef : drag.dragRef
    };
}
export function useDragDropContextProvider(): iDragDropContext {
    const [dragItem, setDragItem] = useStateEX<iDraggedItemType<string>>(null);

    //build context
    const ctx: iDragDropContext = {
        isDragging: !isNullOrUndefined(dragItem),
        dragItem, setDragItem
    };


    return ctx;
}

interface iProps {
}
export const DragDropContextProvider: React.FunctionComponent<React.PropsWithChildren<iProps>> = (props) => {
    const provider = useDragDropContextProvider();
    return <DragDropContext.Provider value={provider}>
        <DndProvider backend={HTML5Backend}>
            {props.children}
        </DndProvider>
    </DragDropContext.Provider>;
}