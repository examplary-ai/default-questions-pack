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
import { MenuIcon, TrashIcon } from "lucide-react";

import {
  FrontendQuestionSettingsAreaComponent,
  MinimalRichTextField,
} from "@examplary/ui";

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setMultipleSettings,
  t,
}) => {
  const options: string[] = [...(settings.options || []), ""];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const setOptions = (options: string[]) => {
    const filteredOptions = options.filter((o) => o && o.trim() !== "");
    setMultipleSettings({
      options: filteredOptions,
      correctAnswer: filteredOptions,
    });
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      setOptions(arrayMove(options, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block font-semibold font-heading mb-2">
          {t("options")}
        </label>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={options.map((_, i) => i.toString())}
            strategy={verticalListSortingStrategy}
          >
            {options.map((value, index) => (
              <SortableItem
                key={index}
                index={index}
                value={value}
                options={options}
                setOptions={setOptions}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div className="text-xs text-zinc-500 mt-3">{t("help")}</div>
      </div>
    </div>
  );
};

export const SortableItem = ({ index, value, options, setOptions, t }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      className="mb-2 flex items-center px-1 rounded-4xl border border-border bg-white"
      style={style}
      data-type="option"
      {...attributes}
    >
      <button className="cursor-move p-3 text-zinc-400" {...listeners}>
        <MenuIcon className="size-3.5" />
      </button>
      <div className="min-w-5 text-sm font-medium font-heading text-zinc-500 text-right">
        {index + 1}.{" "}
      </div>
      <div className="flex-1">
        <MinimalRichTextField
          singleLine
          data-type="option-text"
          value={value || ""}
          onChange={(value) => {
            const next = [...options];
            next[index] = value;
            setOptions(next);
          }}
          placeholder={t("placeholder")}
          className="w-full text-sm p-2"
          onKeyUp={(e) => {
            const isLast = value && index === options.length - 1;
            const empty = !value || value.trim() === "";

            const s = '[data-type="option-text"] [contenteditable]';
            const opt = (e.target as HTMLElement).closest(
              '[data-type="option"]'
            );
            const nextInput = opt?.nextElementSibling?.querySelector(s);
            const prevInput = opt?.previousElementSibling?.querySelector(s);

            // Move over to next input when Enter is pressed
            if (e.key === "Enter" && !e.shiftKey) {
              if (nextInput) {
                e.preventDefault();
                (nextInput as HTMLElement).focus();
                return false;
              } else if (isLast) {
                e.preventDefault();
                setOptions([...options, ""]);
                setTimeout(() => {
                  const all = document.querySelectorAll(s);
                  if (all?.[all.length - 1]) {
                    (all?.[all.length - 1] as HTMLElement).focus();
                  }
                }, 100);
                return false;
              }
              return;
            }

            // Remove the current input when it's empty and Backspace is pressed
            if (empty && e.key === "Backspace") {
              const newOptions = [...options];
              newOptions.splice(index, 1);
              setOptions(newOptions);
              if (prevInput) (prevInput as HTMLElement).focus();
              return;
            }
          }}
        />
      </div>
      {index !== options.length - 1 && (
        <button
          className="p-2 text-zinc-400 hover:text-red-600"
          onClick={() => {
            const next = options.filter((_, i) => i !== index);
            setOptions(next);
          }}
        >
          <TrashIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
};

export default SettingsAreaComponent;
