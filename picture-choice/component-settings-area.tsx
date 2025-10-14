import { useState } from "react";

import {
  RadioGroup,
  RadioGroupItem,
  FrontendQuestionSettingsAreaComponent,
  cn,
} from "@examplary/ui";
import { ImageIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";

const CorrectAnswerIndicator = ({ className = "" }) => (
  <div
    className={cn(
      "absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full",
      className
    )}
  >
    Correct
  </div>
);

const Tooltipped = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => <div title={content}>{children}</div>;

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setMultipleSettings,
  api,
  t,
}) => {
  const [uploading, setUploading] = useState<string | null>(null);

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
      .map((option: any) => option.value)?.[0];

    if (!correctAnswer && newOptions.length) {
      correctAnswer = newOptions[0].value;
    }

    setMultipleSettings({
      options: newOptions.map((option: any) => option.value),
      correctAnswer,
    });
  };

  const handleImageUpload = async (index: number) => {
    try {
      setUploading(index.toString());
      const { url, name } = await api.uploadFile("image/*");

      const newOptions = [...options];
      if (index === options.length) {
        newOptions.push({ value: url, correct: false });
      } else {
        newOptions[index] = {
          ...newOptions[index],
          value: url,
        };
      }
      updateOptions(newOptions);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(null);
    }
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      correct: i === index,
    }));
    updateOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    updateOptions(newOptions);
  };

  return (
    <RadioGroup
      value={Math.max(
        options.findIndex((option) => option.correct),
        0
      ).toString()}
    >
      <div className="flex flex-col items-start gap-4 pt-3 pb-1">
        <label className="font-semibold font-heading">{t("options")}</label>
        {[...options, { value: "", correct: false }].map((option, index) => (
          <div
            key={index}
            className="flex gap-3 items-start w-full p-3 border border-gray-200 rounded"
            data-type="option"
          >
            <RadioGroupItem
              className="shrink-0 mt-1 data-[state=checked]:text-emerald-500"
              value={index.toString()}
              disabled={index === options.length || !option.value}
              onClick={() => handleCorrectChange(index)}
            />

            <div className="flex-1">
              {option.value ? (
                <div className="relative flex gap-2 items-start">
                  <img
                    src={option.value}
                    alt={"Option image"}
                    className="max-w-48 max-h-32 object-contain rounded-lg border border-border"
                  />
                  {option.correct && <CorrectAnswerIndicator className="mt-1 mr-1" />}
                </div>
              ) : (
                <button
                  className="w-48 h-32 border border-dashed border-gray-300 rounded flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition cursor-pointer"
                  onClick={() => handleImageUpload(index)}
                  disabled={uploading === index.toString()}
                >
                  {uploading === index.toString() ? (
                    <>
                      <Loader2Icon className="size-6 text-gray-600 animate-spin" />
                      <span className="text-sm text-gray-500">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="size-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {t("upload-image")}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {option.value && (
              <Tooltipped content={t("change-image")}>
                <button
                  className="ml-auto pl-1 text-gray-500 hover:text-gray-900 transition cursor-pointer"
                  onClick={() => handleImageUpload(index)}
                >
                  <UploadIcon className="size-4" strokeWidth={2.4} />
                </button>
              </Tooltipped>
            )}
            {options.length > 1 && index !== options.length && option.value && (
              <button
                className="ml-auto pl-0.5 text-gray-500 hover:text-red-500 transition cursor-pointer"
                onClick={() => handleRemoveOption(index)}
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

export default SettingsAreaComponent;
