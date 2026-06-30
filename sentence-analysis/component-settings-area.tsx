import { AiIcon, Button, cn, Input } from "@examplary/ui";
import type { FrontendQuestionSettingsAreaComponent } from "@examplary/ui";
import { useState } from "react";

import {
  DEFAULT_LABELS,
  LABELS,
  createSingleSegmentParse,
  normalizeParse,
} from "./shared";
import ParseEditor from "./lib/parse-editor";
import type { SentenceParse, ZinsdeelCode } from "./shared";

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  api,
  settings,
  setSetting,
  setMultipleSettings,
  t,
}) => {
  const [aiBusy, setAiBusy] = useState(false);
  const sentence = settings.sentence || "";
  const enabledLabels =
    (settings.enabledLabels as ZinsdeelCode[]) || DEFAULT_LABELS;
  const requirePv = settings.requirePersoonsvorm !== false;
  const correctAnswer = normalizeParse(sentence, settings.correctAnswer);

  const setSentence = (value: string) => {
    setMultipleSettings({
      sentence: value,
      correctAnswer: createSingleSegmentParse(value),
    });
  };

  const setEnabledLabels = (labels: ZinsdeelCode[]) => {
    setMultipleSettings({
      enabledLabels: labels,
      correctAnswer: {
        ...correctAnswer,
        segments: correctAnswer.segments.map((segment) => ({
          ...segment,
          label:
            segment.label && labels.includes(segment.label)
              ? segment.label
              : null,
        })),
      },
    });
  };

  const setParse = (parse: SentenceParse) => {
    setSetting("correctAnswer", parse);
  };

  const toggleLabel = (code: ZinsdeelCode) => {
    const next = enabledLabels.includes(code)
      ? enabledLabels.filter((label) => label !== code)
      : [...enabledLabels, code];
    setEnabledLabels(next);
  };

  const draftWithAi = async () => {
    const generate = (api as any).ai?.generate;
    if (!generate || !sentence.trim()) return;

    setAiBusy(true);
    try {
      const result = await generate({
        messages: [
          {
            role: "system",
            content:
              "Je ontleedt Nederlandse zinnen redekundig. Geef alleen geldige JSON terug volgens het schema.",
          },
          {
            role: "user",
            content: JSON.stringify({
              task: "Ontleed deze zin in zinsdelen.",
              sentence,
              enabledLabels,
              requirePersoonsvorm: requirePv,
              labels: LABELS.map((label) => ({
                code: label.code,
                nl: label.nl,
              })),
            }),
          },
        ],
        schema: {
          type: "object",
          properties: {
            raw: { type: "string" },
            segments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  startToken: { type: "number" },
                  endToken: { type: "number" },
                  label: { type: ["string", "null"] },
                },
                required: ["startToken", "endToken", "label"],
              },
            },
            persoonsvorm: {
              anyOf: [
                { type: "null" },
                {
                  type: "object",
                  properties: {
                    startToken: { type: "number" },
                    endToken: { type: "number" },
                  },
                  required: ["startToken", "endToken"],
                },
              ],
            },
          },
          required: ["segments", "persoonsvorm"],
        },
      });
      const draft = normalizeParse(sentence, {
        ...result,
        raw: sentence,
      });
      setParse({
        ...draft,
        segments: draft.segments.map((segment) => ({
          ...segment,
          label:
            segment.label && enabledLabels.includes(segment.label)
              ? segment.label
              : null,
        })),
      });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block font-heading font-semibold">
          {t("sentence")}
        </label>
        <Input
          value={sentence}
          onChange={(event) => setSentence(event.target.value)}
          placeholder={t("sentence-placeholder")}
          className="w-full rounded-xl"
        />
      </div>

      <div>
        <label className="mb-2 block font-heading font-semibold">
          {t("enabled-labels")}
        </label>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {LABELS.map((label) => {
            const checked = enabledLabels.includes(label.code);
            return (
              <label
                key={label.code}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm",
                  checked && "bg-accent",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLabel(label.code)}
                />
                <span className="font-semibold">{label.code}</span>
                <span>{label.nl}</span>
              </label>
            );
          })}
        </div>
      </div>

      {sentence.trim() && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block font-heading font-semibold">
              {t("model-answer")}
            </label>
            <div className="flex items-center gap-2">
              {(api as any).ai?.generate && (
                <Button
                  size="sm"
                  variant="secondary"
                  className={cn(
                    "py-1 pr-2 pl-1.5 text-xs h-auto bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200",
                    aiBusy && "bg-fuchsia-200 animate-pulse",
                  )}
                  onClick={draftWithAi}
                  disabled={aiBusy || !sentence.trim()}
                >
                  <AiIcon className="size-3.5" />
                  {aiBusy ? t("ai-working") : t("ai-parse")}
                </Button>
              )}
            </div>
          </div>

          <ParseEditor
            parse={correctAnswer}
            enabledLabels={enabledLabels}
            requirePersoonsvorm={requirePv}
            onChange={setParse}
            t={t}
            framed
          />
        </div>
      )}
    </div>
  );
};

export default SettingsAreaComponent;
