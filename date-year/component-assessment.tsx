import { FrontendAssessmentComponent, Input } from "@examplary/ui";

const DateYearQuestionComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
}) => {
  // Get the configuration from question settings
  const config = question.settings?.dateConfig || {
    dateType: "year",
    correctAnswer: "",
  };
  const { dateType } = config;

  return (
    <Input
      type={dateType === "year" ? "number" : "date"}
      placeholder={dateType === "year" ? "YYYY" : "Select date"}
      value={answer?.value || ""}
      onChange={(e) => {
        const value = e.target.value;
        const valid =
          value &&
          (dateType === "year"
            ? /^[\d-]{1,6}$/.test(value)
            : value.match(/^\d{4}-\d{2}-\d{2}$/));
        saveAnswer({ value, completed: !!valid });
      }}
      style={dateType === "year" ? { width: "8rem" } : { width: "10rem" }}
    />
  );
};

export default DateYearQuestionComponent;
