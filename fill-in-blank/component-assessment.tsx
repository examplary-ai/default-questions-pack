import {
  FrontendAssessmentComponent,
  Input,
  RichTextDisplay,
  RichTextField,
} from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  t,
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
          className="w-40 inline-flex mx-1"
          value={value[index] || ""}
          data-index={index}
          onChange={(event) =>
            setValue(
              Number(event.currentTarget.dataset.index),
              event.currentTarget.value
            )
          }
        />
      );
      index++;
    }
    output.push(<RichTextDisplay as="span">{place}</RichTextDisplay>);
  }

  return output;
};

export default AssessmentComponent;
