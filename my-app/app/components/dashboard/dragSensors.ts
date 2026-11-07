"use client";

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Sensors for every sortable list in the dashboard. Pointer events cover mouse,
 * touch and pen alike, so dragging works the same on phones, tablets, desktops
 * and the browser's device emulation. A drag starts after a 6px move, so a tap
 * or click on an item still works. The keyboard picks up with Space and moves
 * with the arrow keys.
 */
export function useDragSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
}

/**
 * For each draggable item. Without `touch-action: none` a phone treats the
 * finger's move as a page scroll and the drag never starts.
 */
export const DRAGGABLE_CLASS = "touch-none select-none [-webkit-touch-callout:none]";

/** For buttons inside a draggable item: a press on them never starts a drag. */
export const notDraggable = {
  onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
  onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
};
