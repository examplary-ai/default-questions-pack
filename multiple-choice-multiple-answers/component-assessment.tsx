import {
  Checkbox,
  FrontendAssessmentComponent,
  RichTextDisplay,
} from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
}) => {
  return (
    <div className="flex flex-col items-start gap-3 pt-3">
      {(question.settings.options || []).map((option, index) => (
        <label key={index} className="flex gap-3 items-start w-full">
          <Checkbox
            className="mt-0.5"
            checked={answer?.value?.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                saveAnswer({
                  value: [...(answer?.value || []), option.value],
                  completed: true,
                });
              } else {
                const selection = ((answer?.value as string[]) || []).filter(
                  (v) => v !== option.value
                );
                saveAnswer({
                  value: selection,
                  completed: selection.length > 0,
                });
              }
            }}
          />
          <RichTextDisplay className="text-sm">{option.value}</RichTextDisplay>
        </label>
      ))}
    </div>
  );
};

export default AssessmentComponent;
