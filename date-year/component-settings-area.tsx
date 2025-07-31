import {
  FrontendQuestionSettingsAreaComponent,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@examplary/ui";

const DateYearAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setSetting,
  t,
}) => {
  return (
    <div className="space-y-4 mt-1.5">
      <Label>{t("correct-answer")}</Label>
      <RadioGroup
        value={settings.dateType || "year"}
        onValueChange={(dateType) => setSetting("dateType", dateType)}
        style={{
          marginTop: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1.125rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RadioGroupItem value="year" id="year" />
          <label htmlFor="year" style={{ fontSize: "0.875rem" }}>
            {t("year-only")}
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RadioGroupItem value="full-date" id="full-date" />
          <label htmlFor="full-date" style={{ fontSize: "0.875rem" }}>
            {t("full-date")}
          </label>
        </div>
      </RadioGroup>

      <div>
        <Input
          id="correct-answer"
          className="mt-2"
          type={settings.dateType === "full-date" ? "date" : "number"}
          placeholder={
            settings.dateType === "full-date"
              ? t("correct-answer-placeholder")
              : "1925"
          }
          value={settings.correctAnswer}
          onChange={(e) => setSetting("correctAnswer", e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateYearAreaComponent;
