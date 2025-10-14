import { useState } from "react";

import {
  RadioGroup,
  RadioGroupItem,
  FrontendQuestionSettingsAreaComponent,
  cn,
  RichTextField,
} from "@examplary/ui";
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setSetting,
  api,
  t,
}) => {
  const correctAnswer = (settings.correctAnswer as string[]) || [];

  const insertBlank = () => {
    const current = settings.text || "";
    setSetting("text", current + " ___ ");
  };

  const blanks = (settings.text || "").split("___").length - 1;

  return (
    <div className="space-y-5">
      <div>
        <label className="block font-semibold font-heading mb-1">
          {t("text")}
        </label>
        <RichTextField
          value={settings.text || ""}
          onChange={(value) => setSetting("text", value)}
          placeholder={t("placeholder")}
          className="w-full"
        />
        <div className="text-sm text-zinc-500 mt-1.5">
          {t("help")}{" "}
          <button
            className="text-black underline cursor-pointer"
            onClick={insertBlank}
          >
            {t("insert-blank")}
          </button>
        </div>
      </div>
      {blanks > 0 && (
        <div>
          <label className="block font-semibold font-heading mb-1">
            {t("correct-answers")}
          </label>
          <div>
            {Array.from({ length: blanks }).map((_, index) => (
              <div key={index} className="mb-2 flex items-center gap-1">
                {index + 1}.{" "}
                <RichTextField
                  singleLine
                  value={correctAnswer[index] || ""}
                  onChange={(value) => {
                    const next = [...correctAnswer];
                    next[index] = value;
                    setSetting("correctAnswer", next);
                  }}
                  placeholder={t("correct-answer-placeholder", {
                    number: index + 1,
                  })}
                  className="min-w-24"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsAreaComponent;
