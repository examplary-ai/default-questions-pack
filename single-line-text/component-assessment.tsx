import { FrontendAssessmentComponent, RichTextField } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({ answer, saveAnswer }) => {
  return (
    <RichTextField
      singleLine
      value={(answer?.value as string) || ""}
      onChange={(value) => {
        const valid = value.trim().length > 0;
        saveAnswer({ value, completed: valid });
      }}
    />
  );
};

export default AssessmentComponent;
