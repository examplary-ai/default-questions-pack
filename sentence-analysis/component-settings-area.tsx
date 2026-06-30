import {
  AiIcon,
  cn,
  Input,
  Textarea,
} from "@examplary/ui";
import type { FrontendQuestionSettingsAreaComponent } from "@examplary/ui";
import { Fragment, useState } from "react";

import {
  DEFAULT_LABELS,
  LABELS,
  createFullySplitParse,
  normalizeParse,
  segmentText,
  setSegmentLabel,
  toggleBoundary,
  togglePersoonsvorm,
} from "./shared";
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
      correctAnswer: createFullySplitParse(value),
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

  const applyExample = () => {
    const raw = "Vandaag maken wij de jaarplanner voor klas 2.";
    setMultipleSettings({
      sentence: raw,
      enabledLabels: ["BWB", "WG", "OW", "LV"],
      requirePersoonsvorm: true,
      correctAnswer: {
        raw,
        tokens: createFullySplitParse(raw).tokens,
        segments: [
          { startToken: 0, endToken: 0, label: "BWB" },
          { startToken: 1, endToken: 1, label: "WG" },
          { startToken: 2, endToken: 2, label: "OW" },
          { startToken: 3, endToken: 4, label: "LV" },
          { startToken: 5, endToken: 7, label: "BWB" },
        ],
        persoonsvorm: { startToken: 1, endToken: 1 },
      },
    });
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
          className="w-full"
        />
        <div className="mt-1.5 text-xs text-zinc-500">
          {t("sentence-help")}{" "}
          <button className="underline" type="button" onClick={applyExample}>
            {t("use-example")}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block font-heading font-semibold">
          {t("enabled-labels")}
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {LABELS.map((label) => (
            <label
              key={label.code}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={enabledLabels.includes(label.code)}
                onChange={() => toggleLabel(label.code)}
              />
              <span className="font-semibold">{label.code}</span>
              <span>{label.nl}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={requirePv}
          onChange={(event) =>
            setSetting("requirePersoonsvorm", event.target.checked)
          }
        />
        {t("require-pv")}
      </label>

      {sentence.trim() && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block font-heading font-semibold">
              {t("model-answer")}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-zinc-50"
                onClick={() => setParse(createFullySplitParse(sentence))}
              >
                {t("reset-parse")}
              </button>
              {(api as any).ai?.generate && (
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border border-border bg-black px-2.5 py-1 text-xs text-white",
                    "hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  disabled={aiBusy || !sentence.trim()}
                  onClick={draftWithAi}
                >
                  <AiIcon className={cn("size-3.5", aiBusy && "animate-pulse")} />
                  {aiBusy ? t("ai-working") : t("ai-parse")}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-y-3 rounded-lg border border-border p-3">
            {correctAnswer.segments.map((segment, segmentIndex) => (
              <div className="flex items-stretch" key={segment.startToken}>
                <div className="min-w-20 rounded-lg border border-border bg-white px-2 py-2">
                  <div className="flex flex-wrap gap-x-1 gap-y-1">
                    {correctAnswer.tokens
                      .slice(segment.startToken, segment.endToken + 1)
                      .map((token) => {
                        const isPv =
                          correctAnswer.persoonsvorm?.startToken === token.index &&
                          correctAnswer.persoonsvorm?.endToken === token.index;
                        return (
                          <Fragment key={token.index}>
                            <button
                              type="button"
                              disabled={!requirePv}
                              onClick={() =>
                                setParse(
                                  togglePersoonsvorm(correctAnswer, token.index),
                                )
                              }
                              className={
                                "rounded px-0.5 text-sm leading-6 " +
                                (isPv
                                  ? "underline decoration-2 underline-offset-4"
                                  : "hover:bg-zinc-100")
                              }
                              title={t("toggle-pv")}
                            >
                              {token.text}
                            </button>
                            {token.index < segment.endToken && (
                              <button
                                type="button"
                                onClick={() =>
                                  setParse(toggleBoundary(correctAnswer, token.index))
                                }
                                className="mx-0.5 rounded px-1 text-xs text-zinc-300 hover:bg-zinc-100 hover:text-black"
                                title={t("toggle-boundary")}
                              >
                                |
                              </button>
                            )}
                          </Fragment>
                        );
                      })}
                  </div>
                  <select
                    className="mt-2 h-8 w-full rounded-md border border-border bg-white px-2 text-xs"
                    value={segment.label || ""}
                    onChange={(event) =>
                      setParse(
                        setSegmentLabel(
                          correctAnswer,
                          segmentIndex,
                          (event.target.value || null) as ZinsdeelCode | null,
                        ),
                      )
                    }
                  >
                    <option value="">{t("no-label")}</option>
                    {enabledLabels.map((code) => {
                      const label = LABELS.find((item) => item.code === code);
                      return (
                        <option value={code} key={code}>
                          {code} - {label?.nl || code}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {segment.endToken < correctAnswer.tokens.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setParse(toggleBoundary(correctAnswer, segment.endToken))
                    }
                    className="mx-1 flex w-8 items-center justify-center rounded-md border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-700 hover:text-black"
                    title={t("toggle-boundary")}
                  >
                    |
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            {correctAnswer.segments.map((segment) => (
              <span key={segment.startToken} className="mr-3 inline-block">
                {segmentText(correctAnswer, segment)}: {segment.label || "-"}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block font-heading font-semibold">
          {t("explanation")}
        </label>
        <Textarea
          value={settings.explanation || ""}
          onChange={(event) => setSetting("explanation", event.target.value)}
          placeholder={t("explanation-placeholder")}
          className="min-h-20 w-full"
        />
      </div>
    </div>
  );
};

export default SettingsAreaComponent;
