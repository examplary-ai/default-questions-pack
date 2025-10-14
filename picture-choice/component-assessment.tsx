import { RadioGroup, RadioGroupItem, FrontendAssessmentComponent } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
}) => {
  const options = (question.settings.options || []).filter(Boolean);

  return (
    <RadioGroup
      value={(answer?.value as string) || ""}
      onValueChange={(value) => saveAnswer({ value, completed: true })}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
        {options.map((option, index) => (
          <label
            key={index}
            className="flex flex-col gap-2 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={option}
                alt={`Option ${index + 1}`}
                className="w-full max-w-sm max-h-64 object-contain rounded border-2 transition"
              />
              <RadioGroupItem
                value={option}
                className="absolute top-2 left-2 bg-white/90 border-2"
              />
            </div>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};

export default AssessmentComponent;
