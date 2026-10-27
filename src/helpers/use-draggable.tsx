import { makeStyles } from "@fluentui/react-components";
import { useCallback, useEffect, useRef, useState } from "react";

const useDraggableStyles = makeStyles({
    draggable: {
        cursor: "grab",
        touchAction: "none",
        userSelect: "none"
    }
});

/** makes a position absolute or fixed element draggable. pass in a ref to reuse an existing one,
 * or a new ref is created and returned */
export function useDraggable<T extends HTMLElement>(options?: {
    /** which vertical edge the position is anchored to while dragging. default: top */
    vertical?: "top" | "bottom";
    /** which horizontal edge the position is anchored to while dragging. default: left */
    horizontal?: "left" | "right";
    elementRef?: React.RefObject<T | null>;
}) {
    const { vertical = "top", horizontal = "left", elementRef } = options ?? {};
    const ownRef = useRef<T>(null);
    const ref = elementRef ?? ownRef;
    //offset between the pointer and the element's anchored corner at drag start; null while not dragging
    const dragOffset = useRef<{ x: number; y: number }>(null);
    //pointer position at drag start, used to tell a click from a drag
    const dragStart = useRef<{ x: number; y: number }>(null);
    const wasDragged = useRef(false);
    //distance from the anchored horizontal and vertical edges of the viewport
    const [pos, setPos] = useState<{ x: number; y: number }>(null);

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!dragOffset.current || !ref.current) return;
        if (dragStart.current && Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y) > 4)
            wasDragged.current = true;
        const rect = ref.current.getBoundingClientRect();
        const rawX = horizontal === "left" ? e.clientX - dragOffset.current.x : window.innerWidth - e.clientX - dragOffset.current.x;
        const rawY = vertical === "top" ? e.clientY - dragOffset.current.y : window.innerHeight - e.clientY - dragOffset.current.y;
        const x = Math.min(Math.max(0, rawX), window.innerWidth - rect.width);
        const y = Math.min(Math.max(0, rawY), window.innerHeight - rect.height);
        setPos({ x, y });
    }, [ref, vertical, horizontal]);

    /** keeps the element within the window bounds, call after its size changed */
    const reposition = useCallback(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const curX = horizontal === "left" ? rect.left : window.innerWidth - rect.right;
        const curY = vertical === "top" ? rect.top : window.innerHeight - rect.bottom;
        const x = Math.min(Math.max(0, curX), Math.max(0, window.innerWidth - rect.width));
        const y = Math.min(Math.max(0, curY), Math.max(0, window.innerHeight - rect.height));
        if (x !== curX || y !== curY) setPos({ x, y });
    }, [ref, vertical, horizontal]);

    const onPointerUp = useCallback(() => {
        dragOffset.current = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }, [onPointerMove]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        wasDragged.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
        dragOffset.current = {
            x: horizontal === "left" ? e.clientX - rect.left : rect.right - e.clientX,
            y: vertical === "top" ? e.clientY - rect.top : rect.bottom - e.clientY
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }, [ref, vertical, horizontal, onPointerMove, onPointerUp]);

    //stop dragging if the component unmounts mid-drag
    useEffect(() => () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
    }, [onPointerMove, onPointerUp]);

    //wraps a click handler so it's skipped when the click follows a drag rather than a plain click
    const withClickGuard = useCallback(<A extends unknown[]>(onClick: (...args: A) => void) => (...args: A) => {
        if (wasDragged.current) {
            wasDragged.current = false;
            return;
        }
        onClick(...args);
    }, []);

    const style: React.CSSProperties = pos ? {
        top: vertical === "top" ? pos.y : "auto",
        bottom: vertical === "bottom" ? pos.y : "auto",
        left: horizontal === "left" ? pos.x : "auto",
        right: horizontal === "right" ? pos.x : "auto"
    } : undefined;
    const draggableCSS = useDraggableStyles().draggable;
    return {
        ref, style, onPointerDown, reposition,
        /** class name to put on the elements that drag the element (together with onPointerDown) */
        draggableCSS,
        /** wrap your onclick to prevent click trigger while being dragged */
        withClickGuard
    };
}