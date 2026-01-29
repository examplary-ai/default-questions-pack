import {
  cn,
  FrontendAssessmentComponent,
  RadioGroup,
  RadioGroupItem,
  RichTextDisplay,
} from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  t,
  reviewMode,
}) => {
  const options = [
    {
      value: "true",
      label: t("true"),
    },
    {
      value: "false",
      label: t("false"),
    },
  ];

  return (
    <RadioGroup
      value={(answer?.value as string) || ""}
      onValueChange={(value) => saveAnswer({ value, completed: true })}
    >
      <div className="flex flex-col items-start gap-3 pt-3">
        {options.map((option, index) => (
          <label key={index} className="flex gap-2 items-start w-full">
            <RadioGroupItem value={option.value} />
            <div
              className={cn(
                "text-sm",
                reviewMode &&
                  question?.settings?.correctAnswer === option.value &&
                  "bg-green-100 px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-xl inline-block",
              )}
            >
              {option.label}
            </div>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};

export default AssessmentComponent;
