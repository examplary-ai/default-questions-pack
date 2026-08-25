import { FrontendQuestionSettingsAreaComponent, RichTextField } from "@examplary/ui";

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setSetting,
  t,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block font-semibold font-heading mb-2">
          {t("prompt-label")}
        </label>
        <RichTextField
          value={settings?.conversationalPrompt || ""}
          onChange={(value) => setSetting("conversationalPrompt", value)}
          placeholder={t("prompt-placeholder")}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block font-semibold font-heading mb-2">
          {t("completion-label")}
        </label>
        <RichTextField
          value={settings?.conversationalCompletionCriteria || ""}
          onChange={(value) => setSetting("conversationalCompletionCriteria", value)}
          placeholder={t("completion-placeholder")}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SettingsAreaComponent;
