import { cn, FrontendAssessmentComponent, Input } from "@examplary/ui";

const DateYearQuestionComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
}) => {
  // Get the configuration from question settings
  const dateType = question.settings?.dateType || "year";

  return (
    <Input
      type={dateType === "year" ? "number" : "date"}
      placeholder={
        reviewMode
          ? question.settings.correctAnswer
          : dateType === "year"
            ? "YYYY"
            : "Select date"
      }
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
      className={cn(reviewMode && "placeholder:text-green-800/50")}
      style={dateType === "year" ? { width: "8rem" } : { width: "10rem" }}
    />
  );
};

export default DateYearQuestionComponent;
