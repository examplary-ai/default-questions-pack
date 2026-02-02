import { useMemo } from "react";
import {
  cn,
  FrontendAssessmentComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { RadioGroup, RadioGroupItem } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  saveAnswer,
  answer,
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
    <RadioGroup
      value={(answer?.value as string) || ""}
      onValueChange={(value) => saveAnswer({ value, completed: true })}
    >
      <div className="flex flex-col items-start gap-3 pt-3">
        {options.map((option: string, index: number) => (
          <label key={index} className="flex gap-2 items-start w-full">
            <RadioGroupItem value={option} />
            <RichTextDisplay
              className={cn(
                "text-sm",
                reviewMode &&
                  question.settings.correctAnswer === option &&
                 "bg-green-50 text-green-800 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-xl inline-block",
              )}
            >
              {option}
            </RichTextDisplay>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};

export default AssessmentComponent;
