import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import {
  cn,
  FrontendAssessmentComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { useMemo } from "react";

type Option = { id: string; label: string; value: string };
type Item = {left: Option; right: Option};

const processSide = (text: string): Option => ({
  id: `${text}-${Math.random().toString(36)}`,
  label: text.replace(/\\=/g, "="),
  value: text,
});

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
  t,
}) => {
  const options: Item[] = useMemo(
    () =>
      (question.settings.pairs || []).map((item: string) => {
        const [left, right] = item.split(" = ", 2);
        return { left: processSide(left), right: processSide(right) };
      }),
    [question],
  );

  const horizontal =
    question.settings.layout === "horizontal" &&
    question.settings.pairs?.length! <= 4;

  const leftItems = useMemo(() => {
    const items = options?.map((pair: Item) => pair.left) || [];
    if (question.settings.shuffle) {
      return items.sort(() => 0.5 - Math.random());
    }
    return items;
  }, [question]);

  const rightOptions = useMemo(
    () => options.map((pair) => pair.right),
    [options],
  );

  // Map from slot index to the unique right option ID placed there
  const placements: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    const answers = (answer?.value as string[]) || [];
    leftItems.forEach((leftItem: Option, slotIndex: number) => {
      const answerMatch = answers.find((ans: string) =>
        ans.startsWith(`${leftItem.value} = `),
      );
      if (answerMatch) {
        const rightValue = answerMatch.split(" = ", 2)[1];
        const placedIds = new Set(Object.values(map));
        const option = rightOptions.find(
          (opt) => opt.value === rightValue && !placedIds.has(opt.id),
        );
        if (option) map[slotIndex] = option.id;
      }
    });
    return map;
  }, [leftItems, answer, rightOptions]);

  const availableAnswers: Option[] = useMemo(() => {
    const placedIds = new Set(Object.values(placements));
    return rightOptions
      .filter((opt) => !placedIds.has(opt.id))
      .sort(() => 0.5 - Math.random());
  }, [rightOptions, placements]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const draggedId = active.id as string;
    const draggedOption = rightOptions.find((opt) => opt.id === draggedId);
    if (!draggedOption) return;

    const newPlacements = { ...placements };

    // Remove dragged item from its current slot (if any)
    for (const key of Object.keys(newPlacements)) {
      if (newPlacements[Number(key)] === draggedId) {
        delete newPlacements[Number(key)];
      }
    }

    if (over) {
      const slotIndex = Number(over.id);
      // If slot is occupied, unplace its current item
      delete newPlacements[slotIndex];
      newPlacements[slotIndex] = draggedId;
    }

    const newAnswers = Object.entries(newPlacements).map(
      ([slotIndex, optId]) => {
        const left = leftItems[Number(slotIndex)];
        const right = rightOptions.find((opt) => opt.id === optId)!;
        return `${left.value} = ${right.value}`;
      },
    );

    saveAnswer({
      value: newAnswers,
      completed: newAnswers.length === leftItems.length,
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col gap-3", horizontal && "md:flex-row!")}>
        {leftItems.map((leftItem: Option, index: number) => {
          const placedOptionId = placements[index];
          const placedOption = placedOptionId
            ? rightOptions.find((o) => o.id === placedOptionId)
            : null;
          return (
            <div
              className={cn(
                "flex items-center",
                horizontal && "flex-1 md:flex-col",
              )}
              data-type="matching-option"
            >
              <div className="flex-1 w-full border border-border rounded-3xl p-2 px-4 min-h-10 min-w-16 overflow-hidden">
                <RichTextDisplay className="text-sm">
                  {leftItem.label}
                </RichTextDisplay>
              </div>
              <div
                className={
                  !horizontal ? "h-0.25 w-5 bg-border" : "w-0.25 h-5 bg-border"
                }
              />
              <RightSlot
                id={index}
                value={placedOption?.label || ""}
                reviewMode={reviewMode}
                correctAnswer={question.settings.correctAnswer?.[index]}
              >
                {placedOption && (
                  <RightItem id={placedOption.id} key={placedOption.id}>
                    {placedOption.label}
                  </RightItem>
                )}
              </RightSlot>
            </div>
          );
        })}
      </div>

      {availableAnswers.length > 0 && (
        <div className="mt-8 bg-bg rounded-xl p-5 flex flex-col gap-5 items-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableAnswers.map((opt: Option) => (
              <RightItem className="border-black" id={opt.id} key={opt.id}>
                {opt.label}
              </RightItem>
            ))}
          </div>
          <p className="text-zinc-500 text-xs select-none">
            {t("drag-options")}
          </p>
        </div>
      )}
    </DndContext>
  );
};

const RightSlot = ({ children, id, value, reviewMode, correctAnswer }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const hasValue = !!value;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 w-full rounded-3xl min-h-10 min-w-16 flex-shrink-0",
        "[&>button]:w-full [&>button]:flex-1 relative",
        isOver && "bg-accent",
        !hasValue && "border border-zinc-800 border-dashed",
      )}
    >
      {reviewMode && correctAnswer && !hasValue && (
        <RichTextDisplay className="absolute inset-0 px-4 text-sm flex flex-1 items-center text-left ellipsis text-green-800/50 select-none">
          {correctAnswer?.split(" = ")?.[1]?.replace(/\\=/g, "=")}
        </RichTextDisplay>
      )}
      {children}
    </div>
  );
};

const RightItem = ({ children, id, className = "" }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (!children) return null;

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "bg-accent px-4 min-h-10 rounded-3xl border border-border text-left cursor-move text-sm",
        isDragging && "shadow-xl",
        className,
      )}
      style={style}
      {...listeners}
      {...attributes}
    >
      <RichTextDisplay>{children}</RichTextDisplay>
    </button>
  );
};

export default AssessmentComponent;
