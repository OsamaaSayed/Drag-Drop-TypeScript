//* Drag & Drop Interfaces 
export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
    dragOverHandler(event: DragEvent): void; //! to tell the browser that the place you are dragging over it is a valid drag target place (fires awl m t5ush 3al place)
    dropHandler(event: DragEvent): void; //! to react to the actual drop that happens.
    dragLeaveHandler(event: DragEvent): void; //! to give some visual feedback to the user or if no drop happens and instead it canceled or the user moves the element away.
}
