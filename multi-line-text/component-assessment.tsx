import { FrontendAssessmentComponent, RichTextField } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  t,
}) => {
  return (
    <RichTextField
      value={(answer?.value as string) || ""}
      placeholder={t("placeholder")}
      onChange={(value) => {
        const valid = value.trim().length > 0;
        saveAnswer({ value, completed: valid });
      }}
    />
  );
};

export default AssessmentComponent;
