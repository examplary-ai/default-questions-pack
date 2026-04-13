import { FrontendAssessmentComponent, RichTextField } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  environment,
  t,
}) => {
  return (
    <RichTextField
      value={(answer?.value as string) || ""}
      placeholder={t("placeholder")}
      onChange={(value) => {
        const valid = (value as string)?.trim().length > 0;
        saveAnswer({ value: value as string, completed: valid });
      }}
      className={environment === "practice-space" ? "pr-16" : ""}
    />
  );
};

export default AssessmentComponent;
