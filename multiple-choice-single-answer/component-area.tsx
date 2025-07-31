import {
  MinimalRichTextField,
  RadioGroup,
  RadioGroupItem,
} from "@examplary/ui";
import { Trash2Icon } from "lucide-react";

import { CorrectAnswerIndicator } from "../multiple-choice-multiple-answers/components/correct-answer-indicator";

export default ({ settings, setSetting, t }) => {
  const options = settings.options || [];

  return (
    <RadioGroup
      value={Math.max(
        options.findIndex((option) => option.correct),
        0
      ).toString()}
    >
      <div className="flex flex-col items-start gap-3 pt-3 pb-1">
        {[...options, { value: "", correct: false }].map((option, index) => (
          <div
            key={index}
            className="flex gap-2 items-start w-full"
            data-type="option"
          >
            <RadioGroupItem
              className="shrink-0 data-[state=checked]:text-emerald-500"
              value={index.toString()}
              disabled={index === options.length}
              onClick={() => {
                const newOptions = [
                  ...options.map((o) => ({ ...o, correct: false })),
                ];
                newOptions[index] = { ...option, correct: true };
                setSetting("options", newOptions);
              }}
            />
            <div className="flex-1 flex items-center gap-2">
              <MinimalRichTextField
                singleLine
                className="text-sm"
                data-type="option-text"
                value={option.value}
                onChange={(value) => {
                  const newOptions = [...options];
                  newOptions[index] = { ...option, value };
                  setSetting("options", newOptions);
                }}
                placeholder={t("option-placeholder")}
                onKeyUp={(e) => {
                  const isLast = option.value && index === options.length - 1;
                  const empty = !option.value.trim();

                  const s = '[data-type="option-text"] [contenteditable]';
                  const opt = (e.target as HTMLElement).closest(
                    '[data-type="option"]'
                  );
                  const nextInput = opt?.nextElementSibling?.querySelector(
                    s
                  ) as HTMLElement;
                  const prevInput = opt?.previousElementSibling?.querySelector(
                    s
                  ) as HTMLElement;

                  // Move over to next input when Enter is pressed
                  if (e.key === "Enter" && !e.shiftKey && isLast) {
                    if (nextInput) {
                      e.preventDefault();
                      nextInput.focus();
                      return false;
                    }
                    return;
                  }

                  // Remove the current input when it's empty and Backspace is pressed
                  if (empty && e.key === "Backspace") {
                    const newOptions = [...options];
                    newOptions.splice(index, 1);
                    setSetting("options", newOptions);
                    if (prevInput) prevInput.focus();
                    return;
                  }
                }}
              />
              {option.correct && <CorrectAnswerIndicator t={t} />}
            </div>

            {options.length > 1 && index !== options.length && (
              <button
                className="ml-auto pl-1 text-gray-500 hover:text-black transition cursor-pointer"
                onClick={() => {
                  const newOptions = [...options];
                  newOptions.splice(index, 1);
                  setSetting("options", newOptions);
                }}
                tabIndex={-1}
                title={t("option-remove")}
              >
                <Trash2Icon className="size-4" strokeWidth={2.4} />
              </button>
            )}
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};
