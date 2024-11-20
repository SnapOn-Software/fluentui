import { isNullOrUndefined } from "@kwiz/common";
import React, { useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useStateEX } from "../hooks";
import { iDraggableProps, iDraggedItemType, useDraggable } from "./use-draggable";
import useDroppable, { iDroppableProps } from "./use-droppable";

export interface iDragDropContext {
    isDragging: boolean;
    setIsDragging: (value: boolean) => void;
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
    const acceptDrops = isDroppable && !drag.isDragging && dragDropContext.isDragging;

    return {
        dragDropContext,
        drag,
        drop,
        dragDropRef: isDraggable && !isDroppable
            ? drag.dragRef
            : !isDraggable && isDroppable
                ? drop.dropRef
                //both drag and drop allowed
                : acceptDrops ? drop.dropRef : drag.dragRef
    };
}
export function useDragDropContextProvider(): iDragDropContext {
    const [isDragging, setIsDragging] = useStateEX(false);

    //build context
    const ctx: iDragDropContext = {
        isDragging, setIsDragging
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