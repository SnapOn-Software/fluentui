import { NativeTypes } from 'react-dnd-html5-backend';
import { iDraggedItemType, iDroppableProps } from './drag-drop.types';

export { DragDropContainer } from './drag-drop-container';
export { DragDropContextProvider, useDragDropContext } from "./drag-drop-context";
export type { iDraggedItemType, iDroppableProps } from "./drag-drop.types";

type fileNativeType = typeof NativeTypes.FILE;
interface dragFiles extends iDraggedItemType<fileNativeType> {
    files: FileList;
}
export type dropFiles = iDroppableProps<fileNativeType, dragFiles>;
