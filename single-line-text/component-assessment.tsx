import { FrontendAssessmentComponent, RichTextField } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  t,
}) => {
  return (
    <RichTextField
      singleLine
      value={(answer?.value as string) || ""}
      placeholder={t("placeholder")}
      onChange={(value) => {
        const valid = (value as string)?.trim().length > 0;
        saveAnswer({ value: value as string, completed: valid });
      }}
    />
  );
};

export default AssessmentComponent;
