import {
  FrontendAssessmentComponent,
  RadioGroup,
  RadioGroupItem,
} from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  t,
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
            <div className="text-sm">{option.label}</div>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};

export default AssessmentComponent;
