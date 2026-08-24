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
  const blankCount = places.length - 1;

  const setValue = (index: number, newValue: string) => {
    // Build the array from the blank count rather than from the existing
    // answer: skipping a blank would otherwise leave a hole, which serialises
    // to null and makes responseProcessing error out on it
    const newAnswer = Array.from(
      { length: blankCount },
      (_, i) => value[i] ?? "",
    );
    newAnswer[index] = newValue;
    saveAnswer({
      value: newAnswer,
      completed:
        newAnswer.filter((v) => v && v.trim().length > 0).length >= blankCount,
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
