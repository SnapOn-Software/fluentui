import { NativeTypes } from 'react-dnd-html5-backend';
import { iDraggedItemType } from './use-draggable';
import { iDroppableProps } from './use-droppable';

export { DragDropContainer } from './drag-drop-container';
export { DragDropContextProvider, useDragDropContext } from "./drag-drop-context";
export type { iDraggedItemType } from "./use-draggable";
export type { iDroppableProps } from "./use-droppable";

type fileNativeType = typeof NativeTypes.FILE;
interface dragFiles extends iDraggedItemType<fileNativeType> {
    files: FileList;
}
export type dropFiles = iDroppableProps<fileNativeType, dragFiles>;
