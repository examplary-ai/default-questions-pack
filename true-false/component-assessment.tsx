import { FrontendAssessmentComponent } from "@examplary/ui";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  t,
}) => {
  const options = [
    {
      value: "true",
      label: t("true"),
    },
    {
      value: "false",
      label: t("false"),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.75rem",
        paddingTop: "0.75rem",
      }}
    >
      {options.map((option, index) => (
        <label
          key={index}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="true-false-answer"
            value={option.value}
            checked={(answer?.value as string) === option.value}
            onChange={(e) =>
              saveAnswer({ value: e.target.value, completed: true })
            }
            style={{ marginTop: "0.125rem" }}
          />
          <div style={{ fontSize: "0.875rem" }}>{option.label}</div>
        </label>
      ))}
    </div>
  );
};

export default AssessmentComponent;
