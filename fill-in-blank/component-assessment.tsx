import {
  cn,
  FrontendAssessmentComponent,
  Input,
  RichTextDisplay,
} from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
}) => {
  const text = question.settings.text || "";
  const value = (answer?.value as string[]) || [];

  const places = text.split("___");

  const setValue = (index: number, newValue: string) => {
    const newAnswer = [...value];
    newAnswer[index] = newValue;
    saveAnswer({
      value: newAnswer,
      completed:
        newAnswer.filter((v) => v && v.trim().length > 0).length >=
        places.length - 1,
    });
  };

  const output = [];
  let index = 0;
  for (const place of places) {
    if (output.length) {
      output.push(
        <Input
          className={cn(
            "w-48 px-1.5 py-0 m-0.5 rounded-lg h-8 inline-flex mx-1",
            reviewMode && "placeholder:text-green-800/50",
          )}
          value={value[index] || ""}
          data-index={index}
          placeholder={
            reviewMode ? question.settings.correctAnswer?.[index] : undefined
          }
          onChange={(event) =>
            setValue(
              Number(event.currentTarget.dataset.index),
              event.currentTarget.value,
            )
          }
        />,
      );
      index++;
    }
    output.push(<RichTextDisplay as="span">{place}</RichTextDisplay>);
  }

  return output;
};

export default AssessmentComponent;
