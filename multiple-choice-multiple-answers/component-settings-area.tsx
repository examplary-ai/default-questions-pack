import {
  FrontendQuestionSettingsAreaComponent,
  MinimalRichTextField,
  Checkbox,
} from "@examplary/ui";
import { Trash2Icon } from "lucide-react";
import { CorrectAnswerIndicator } from "./components/correct-answer-indicator";

const OptionsArea: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setMultipleSettings,
  t,
}) => {
  const values = {
    options: settings.options || [],
    correctAnswer: settings.correctAnswer || [],
  };
  if (typeof values.correctAnswer === "string") {
    values.correctAnswer = [values.correctAnswer];
  }

  const options = values.options.map((value: string) => ({
    value,
    correct: values.correctAnswer.includes(value),
  }));

  const updateOptions = (newOptions: any[]) => {
    let correctAnswer = newOptions
      .filter((option: any) => option.correct)
      .map((option: any) => option.value);

    if (!correctAnswer.length && newOptions.length) {
      correctAnswer = [newOptions[0].value];
    }

    setMultipleSettings({
      options: newOptions.map((option: any) => option.value),
      correctAnswer,
    });
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <label className="font-semibold font-heading">{t("options")}</label>
      {[...options, { value: "", correct: false }].map((option, index) => (
        <div
          key={index}
          className="flex gap-3 items-start w-full"
          data-type="option"
        >
          <Checkbox
            checked={option.correct}
            className="mt-0.5 data-[state=checked]:text-emerald-500"
            disabled={index === options.length}
            onCheckedChange={(e) => {
              const newOptions = [...options];
              newOptions[index] = { ...option, correct: e };
              updateOptions(newOptions);
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
                updateOptions(newOptions);
              }}
              placeholder={t("option-placeholder")}
              onKeyUp={(e) => {
                const isLast = option.value && index === options.length - 1;
                const empty = !option.value || option.value.trim() === "";

                const s = '[data-type="option-text"] [contenteditable]';
                const opt = (e.target as HTMLElement).closest(
                  '[data-type="option"]'
                );
                const nextInput = opt?.nextElementSibling?.querySelector(s);
                const prevInput = opt?.previousElementSibling?.querySelector(s);

                // Move over to next input when Enter is pressed
                if (e.key === "Enter" && !e.shiftKey && isLast) {
                  if (nextInput) {
                    e.preventDefault();
                    (nextInput as HTMLElement).focus();
                    return false;
                  }
                  return;
                }

                // Remove the current input when it's empty and Backspace is pressed
                if (empty && e.key === "Backspace") {
                  const newOptions = [...options];
                  newOptions.splice(index, 1);
                  updateOptions(newOptions);
                  if (prevInput) (prevInput as HTMLElement).focus();
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
                updateOptions(newOptions);
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
  );
};

export default OptionsArea;
