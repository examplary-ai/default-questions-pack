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

import {
  findLabel,
  getMatchingData,
  joinPair,
  orderOptions,
  pairPrefix,
  type MatchingOption,
} from "./shared";

type Option = MatchingOption & { id: string };

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
  t,
}) => {
  const { left, right, correctAnswer } = useMemo(
    () => getMatchingData(question.settings),
    [question],
  );

  const horizontal =
    question.settings.layout === "horizontal" && left.length <= 4;

  const leftItems: MatchingOption[] = useMemo(
    () => orderOptions(left, question.settings.shuffle),
    [left],
  );

  // The ID keeps duplicate right values apart for drag-and-drop
  const rightOptions: Option[] = useMemo(
    () =>
      orderOptions(
        right.map((option, index) => ({ ...option, id: `option-${index}` })),
        question.settings.shuffle,
      ),
    [right],
  );

  // Map from slot index to the unique right option ID placed there
  const placements: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    const answers = (answer?.value as string[]) || [];
    leftItems.forEach((leftItem, slotIndex) => {
      const prefix = pairPrefix(leftItem.value);
      const match = answers.find((ans) => ans.startsWith(prefix));
      if (!match) return;
      const placed = Object.values(map);
      const option = rightOptions.find(
        (opt) => opt.value === match.slice(prefix.length) && !placed.includes(opt.id),
      );
      if (option) map[slotIndex] = option.id;
    });
    return map;
  }, [leftItems, answer, rightOptions]);

  const placedIds = Object.values(placements);
  const availableAnswers = rightOptions.filter(
    (opt) => !placedIds.includes(opt.id),
  );

  const correctLabelFor = (leftItem: MatchingOption) => {
    const prefix = pairPrefix(leftItem.value);
    const pair = correctAnswer.find((p) => p.startsWith(prefix));
    return pair && findLabel(right, pair.slice(prefix.length));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: any) {
    if (!rightOptions.some((opt) => opt.id === active.id)) return;

    // Move the dragged option out of its old slot and into the target one
    const newPlacements: Record<number, string> = Object.fromEntries(
      Object.entries(placements).filter(([, id]) => id !== active.id),
    );
    if (over) newPlacements[Number(over.id)] = active.id;

    const newAnswers = Object.entries(newPlacements).map(([slotIndex, optId]) =>
      joinPair(
        leftItems[Number(slotIndex)].value,
        rightOptions.find((opt) => opt.id === optId)!.value,
      ),
    );

    saveAnswer({
      value: newAnswers,
      completed: newAnswers.length === leftItems.length,
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col gap-3", horizontal && "md:flex-row!")}>
        {leftItems.map((leftItem, index) => {
          const placedOption = rightOptions.find(
            (opt) => opt.id === placements[index],
          );
          return (
            <div
              className={cn(
                "flex items-center",
                horizontal && "flex-1 md:flex-col",
              )}
              data-type="matching-option"
              key={index}
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
                correctAnswer={correctLabelFor(leftItem)}
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
            {availableAnswers.map((opt) => (
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
      data-type="matching-right-slot"
      className={cn(
        "flex-1 w-full rounded-3xl min-h-10 min-w-16 flex-shrink-0",
        "[&>button]:w-full [&>button]:flex-1 relative",
        isOver && "bg-accent",
        !hasValue && "border border-zinc-800 border-dashed",
      )}
    >
      {reviewMode && correctAnswer && !hasValue && (
        <RichTextDisplay className="absolute inset-0 px-4 text-sm flex flex-1 items-center overflow-hidden whitespace-nowrap text-left ellipsis text-green-800/50 select-none">
          {correctAnswer}
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
      data-type="matching-value"
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
