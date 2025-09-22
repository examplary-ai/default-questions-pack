import {
  FrontendQuestionSettingsAreaComponent,
  MinimalRichTextField,
  RadioGroup,
  RadioGroupItem,
} from "@examplary/ui";
import { Trash2Icon } from "lucide-react";

const OptionsArea: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setSetting,
  t,
}) => {
  const values = {
    options: settings.options || [],
    correctAnswer: settings.correctAnswer || "",
  };
  if (Array.isArray(values.correctAnswer)) {
    values.correctAnswer = values.correctAnswer?.[0] || [];
  }

  const options = values.options.map((value: string) => ({
    value,
    correct: values.correctAnswer === value,
  }));

  const updateOptions = (newOptions: any[]) => {
    setSetting(
      "options",
      newOptions.map((option: any) => option.value)
    );
    setSetting(
      "correctAnswer",
      newOptions
        .filter((option: any) => option.correct)
        .map((option: any) => option.value)[0]
    );
  };

  return (
    <RadioGroup
      value={Math.max(
        options.findIndex((option) => option.correct),
        0
      ).toString()}
    >
      <div className="flex flex-col items-start gap-3">
        <label className="font-semibold font-heading">{t("options")}</label>
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
                    updateOptions(newOptions);
                    if (prevInput) prevInput.focus();
                    return;
                  }
                }}
              />
              {option.correct && (
                <span className="text-xs whitespace-nowrap font-medium text-white bg-emerald-500 rounded-full px-2 py-0.5">
                  {t("correct-answer")}
                </span>
              )}
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
    </RadioGroup>
  );
};

export default OptionsArea;
