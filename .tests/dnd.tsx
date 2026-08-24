import { act } from "@testing-library/react";

// NOTE: this module must never import "@dnd-kit/core" at the top level. It is
// pulled in from inside the vi.mock factory for that module, so a top-level
// import would deadlock waiting on the mock it is helping to build.

let onDragEnd: ((event: any) => void) | undefined;

/**
 * Mock factory for @dnd-kit/core. It wraps the real DndContext so that the
 * droppables and draggables underneath stay real, and only captures the
 * `onDragEnd` handler — jsdom has no layout, so @dnd-kit's pointer and
 * keyboard sensors can never resolve a drop target on their own.
 *
 * `vi.mock` is hoisted above the imports, so call it from inside the factory:
 *
 *   vi.mock("@dnd-kit/core", async (importOriginal) => {
 *     const { dndCoreMock } = await import("../.tests/dnd");
 *     return dndCoreMock(importOriginal as any);
 *   });
 */
export const dndCoreMock = async (importOriginal: () => Promise<any>) => {
  const actual = await importOriginal();
  const ActualDndContext = actual.DndContext;

  const CapturingDndContext = (props: any) => {
    onDragEnd = props.onDragEnd;
    return <ActualDndContext {...props} />;
  };

  return { ...actual, DndContext: CapturingDndContext };
};

const fireDragEnd = (event: any) => {
  if (!onDragEnd) throw new Error("No DndContext has been rendered");
  act(() => onDragEnd!(event));
};

/** Drops the draggable `activeId` onto the droppable `overId` */
export const dragOnto = (activeId: string, overId: string | number) =>
  fireDragEnd({ active: { id: activeId }, over: { id: overId } });

/** Drops the draggable `activeId` outside of any droppable */
export const dragToNowhere = (activeId: string) =>
  fireDragEnd({ active: { id: activeId }, over: null });
