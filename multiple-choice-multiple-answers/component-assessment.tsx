import {
  Checkbox,
  cn,
  FrontendAssessmentComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { useMemo } from "react";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
}) => {
  const options = useMemo(
    () =>
      question.settings.shuffleAnswers
        ? [...(question.settings.options || [])].sort(() => Math.random() - 0.5)
        : question.settings.options || [],
    [question.settings.options, question.settings.shuffleAnswers],
  );

  return (
    <div className="flex flex-col items-start gap-3 pt-3">
      {options.map((option: string, index: number) => (
        <label key={index} className="flex gap-3 items-start w-full">
          <Checkbox
            className="mt-0.5"
            checked={answer?.value?.includes(option)}
            onCheckedChange={(checked) => {
              if (checked) {
                saveAnswer({
                  value: [...(answer?.value || []), option],
                  completed: true,
                });
              } else {
                const selection = ((answer?.value as string[]) || []).filter(
                  (v) => v !== option,
                );
                saveAnswer({
                  value: selection,
                  completed: selection.length > 0,
                });
              }
            }}
          />
          <RichTextDisplay
            className={cn(
              "text-sm",
              reviewMode &&
                question.settings.correctAnswer?.includes(option) &&
                "bg-green-50 text-green-800 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-xl inline-block",
            )}
          >
            {option}
          </RichTextDisplay>
        </label>
      ))}
    </div>
  );
};

export default AssessmentComponent;
