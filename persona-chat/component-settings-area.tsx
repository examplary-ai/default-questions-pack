import { useState } from "react";
import {
  AiIcon,
  Button,
  cn,
  type FrontendQuestionSettingsAreaComponent,
  RichTextField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@examplary/ui";

import { defaultPersonaId, localized, personas } from "./personas";
import {
  improveInstructionsMessages,
  improveInstructionsSchema,
  stripHtml,
} from "./shared";

// Below this, there is not enough of a draft for the AI to build on
const minimumDraftLength = 20;

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  api,
  question,
  settings,
  setSetting,
  setMultipleSettings,
  i18n,
  t,
}) => {
  const [aiBusy, setAiBusy] = useState(false);

  const language = i18n?.language;
  const instructions = settings?.instructions || "";
  const generate = (api as any).ai?.generate;

  // The button is a one-shot helper for teachers writing their own
  // instructions: it disappears once it has been used, and it never shows up
  // for questions the AI wrote itself (those already have full instructions)
  const canImprove =
    !!generate &&
    !settings?.instructionsImproved &&
    !question?.traceId &&
    stripHtml(instructions).length >= minimumDraftLength;

  const improveWithAi = async () => {
    if (!canImprove || aiBusy) return;

    setAiBusy(true);
    try {
      const result = await generate({
        messages: improveInstructionsMessages(question, settings, language),
        schema: improveInstructionsSchema,
      });

      if (result?.instructions) {
        setMultipleSettings({
          instructions: result.instructions,
          instructionsImproved: true,
        });
      }
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block font-semibold font-heading mb-2">
          {t("persona-label")}
        </label>
        <Select
          value={settings?.persona || defaultPersonaId}
          onValueChange={(value) => setSetting("persona", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("persona-placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {personas.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                {localized(persona.title, language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs text-gray-500">{t("persona-help")}</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="block font-semibold font-heading">
            {t("instructions-label")}
          </label>
          {canImprove && (
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "py-1 pr-2 pl-1.5 text-xs h-auto bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200",
                aiBusy && "bg-fuchsia-200 animate-pulse",
              )}
              onClick={improveWithAi}
              disabled={aiBusy}
            >
              <AiIcon className="size-3.5" />
              {aiBusy ? t("ai-working") : t("ai-improve")}
            </Button>
          )}
        </div>
        <RichTextField
          value={instructions}
          onChange={(value: string) => setSetting("instructions", value)}
          placeholder={t("instructions-placeholder")}
          className="w-full"
        />
        <p className="mt-1.5 text-xs text-gray-500">{t("instructions-help")}</p>
      </div>
    </div>
  );
};

export default SettingsAreaComponent;
