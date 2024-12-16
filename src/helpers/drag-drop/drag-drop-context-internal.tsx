import React, { useContext } from "react";
import { iDragDropContext } from "./drag-drop.types";

//create context
export const DragDropContext = React.createContext<iDragDropContext>(null);
//use context from within controls
export function useDragDropContextInternal() {
    const dragDropContext = useContext(DragDropContext);
    return dragDropContext;
}