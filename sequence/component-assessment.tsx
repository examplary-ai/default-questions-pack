import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MenuIcon } from "lucide-react";

import { FrontendAssessmentComponent, RichTextDisplay } from "@examplary/ui";
import { SortableItem } from "./component-settings-area";
import { useMemo } from "react";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
}) => {
  const shuffledOptions = useMemo(
    () =>
      [...(question.settings.options || [])].sort(() => 0.5 - Math.random()),
    [question.id]
  );
  const options = (answer?.value as string[]) || shuffledOptions;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    console.log({ active, over });

    if (active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      saveAnswer({
        value: arrayMove(options, oldIndex, newIndex),
        completed: true,
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={options.map((_: string, i: number) => i.toString())}
        strategy={verticalListSortingStrategy}
      >
        {options.map((value: string, index: number) => (
          <SortableItem key={index} index={index} value={value} />
        ))}
      </SortableContext>
    </DndContext>
  );
};

const SortableItem = ({ index, value }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      className="mb-2 flex items-center px-1 rounded-4xl border border-border bg-white cursor-move"
      style={style}
      data-type="option"
      {...attributes}
      {...listeners}
    >
      <div className="p-3 text-zinc-400">
        <MenuIcon className="size-3.5" />
      </div>
      <div className="min-w-5 text-sm font-medium font-heading text-zinc-500 text-right">
        {index + 1}.{" "}
      </div>
      <div className="flex-1 p-2 text-sm">
        <RichTextDisplay>{value}</RichTextDisplay>
      </div>
    </div>
  );
};

export default AssessmentComponent;
