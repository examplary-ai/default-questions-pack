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
  const options = question.settings.shuffleAnswers
    ? [...(question.settings.options || [])].sort(() => Math.random() - 0.5)
    : question.settings.options || [];

  return (
    <div className="flex flex-col items-start gap-3 pt-3">
      {options.map((option, index) => (
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
                  (v) => v !== option
                );
                saveAnswer({
                  value: selection,
                  completed: selection.length > 0,
                });
              }
            }}
          />
          <RichTextDisplay className="text-sm">{option}</RichTextDisplay>
        </label>
      ))}
    </div>
  );
};

export default AssessmentComponent;
