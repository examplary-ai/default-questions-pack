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
import { Item } from "./component-settings-area";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  t,
}) => {
  const options: Item[] = useMemo(
    () => 
      (question.settings.pairs || []).map((item: string) => {
        const [left, right] = item.split(" = ", 2);
        return { left, right };
      }),
    [question]
  );

  console.log(options);
  

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

  const rightItems = useMemo(
    () =>
      leftItems.map((leftItem: string) => {
        const answerMatch = (answer?.value as string[])?.find((ans: string) =>
          ans.startsWith(`${leftItem} = `)
        );
        return answerMatch ? answerMatch.split(" = ", 2)[1] : "";
      }),
    [leftItems, answer]
  );

  const availableAnswers = useMemo(() => {
    return (options?.map((pair: Item) => pair.right) || [])
      .filter((item: string) => !rightItems.includes(item))
      .sort(() => 0.5 - Math.random());
  }, [question, rightItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    const currentAnswers = (answer?.value as string[]) || [];
    const newAnswers = currentAnswers.filter(
      (ans: string) => !ans.endsWith(`= ${active.id}`)
    );

    if (over) {
      const left = leftItems[Number(over.id)];
      const value = `${left} = ${active.id}`;
      newAnswers.push(value);
    }

    saveAnswer({
      value: Array.from(newAnswers),
      completed: newAnswers.length === leftItems.length,
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn("flex flex-col gap-3", horizontal && "md:flex-row!")}>
        {leftItems.map((leftItem: string, index: number) => {
          const rightItem = rightItems[index];
          return (
            <div
              className={cn(
                "flex items-center",
                horizontal && "flex-1 md:flex-col"
              )}
              data-type="matching-option"
            >
              <div className="flex-1 w-full border border-border rounded-3xl p-2 px-4 min-h-10 min-w-16 overflow-hidden">
                <RichTextDisplay className="text-sm">
                  {leftItem}
                </RichTextDisplay>
              </div>
              <div
                className={
                  !horizontal ? "h-0.25 w-5 bg-border" : "w-0.25 h-5 bg-border"
                }
              />
              <RightSlot id={index} value={rightItem}>
                <RightItem id={rightItem} key={rightItem}>
                  {rightItem}
                </RightItem>
              </RightSlot>
            </div>
          );
        })}
      </div>

      {availableAnswers.length > 0 && (
        <div className="mt-8 bg-bg rounded-xl p-5 flex flex-col gap-5 items-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {availableAnswers.map((answer: string) => (
              <RightItem className="border-black" id={answer} key={answer}>
                {answer}
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

const RightSlot = ({ children, id, value }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const hasValue = !!value;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 w-full rounded-3xl min-h-10 min-w-16 flex-shrink-0",
        "[&>button]:w-full [&>button]:flex-1",
        isOver && "bg-accent",
        !hasValue && "border border-zinc-800 border-dashed"
      )}
    >
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
        "bg-accent px-4 pl-2 min-h-10 rounded-3xl border border-border text-left cursor-move text-sm",
        isDragging && "shadow-xl",
        className
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
