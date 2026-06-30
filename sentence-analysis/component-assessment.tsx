import { cn } from "@examplary/ui";
import type { FrontendAssessmentComponent } from "@examplary/ui";
import { Fragment, useMemo } from "react";

import {
  DEFAULT_LABELS,
  LABELS,
  answerValueToParse,
  isComplete,
  normalizeParse,
  parseToAnswerValue,
  sameRange,
  segmentText,
  setSegmentLabel,
  toggleBoundary,
  togglePersoonsvorm,
} from "./shared";
import type { SentenceParse, ZinsdeelCode } from "./shared";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  reviewMode,
  t,
}) => {
  const raw = question.settings.sentence || question.settings.correctAnswer?.raw || "";
  const requirePv = question.settings.requirePersoonsvorm !== false;
  const enabledLabels =
    (question.settings.enabledLabels as ZinsdeelCode[]) || DEFAULT_LABELS;

  const value = useMemo(
    () => answerValueToParse(raw, answer?.value),
    [raw, answer?.value],
  );

  const model = useMemo(
    () => normalizeParse(raw, question.settings.correctAnswer),
    [raw, question.settings.correctAnswer],
  );

  const persist = (parse: SentenceParse) => {
    saveAnswer({
      value: parseToAnswerValue(parse, requirePv),
      context: { parse },
      completed: isComplete(parse, requirePv),
    });
  };

  if (!raw.trim()) {
    return (
      <div className="text-sm text-zinc-500 border border-border rounded-lg p-3">
        {t("missing-sentence")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-y-3">
        {value.segments.map((segment, segmentIndex) => {
          const modelSegment = model.segments.find(
            (item) =>
              item.startToken === segment.startToken &&
              item.endToken === segment.endToken,
          );
          const correct =
            reviewMode &&
            modelSegment &&
            modelSegment.label === segment.label;
          const incorrect =
            reviewMode &&
            segment.label &&
            (!modelSegment || modelSegment.label !== segment.label);

          return (
            <div className="flex items-stretch" key={segment.startToken}>
              <div
                className={cn(
                  "min-w-20 rounded-lg border border-border bg-white px-2 py-2",
                  correct && "border-green-300 bg-green-50",
                  incorrect && "border-red-200 bg-red-50",
                )}
              >
                <div className="flex flex-wrap gap-x-1 gap-y-1">
                  {value.tokens
                    .slice(segment.startToken, segment.endToken + 1)
                    .map((token) => {
                      const isPv = sameRange(value.persoonsvorm, {
                        startToken: token.index,
                        endToken: token.index,
                      });
                      const isModelPv =
                        reviewMode &&
                        sameRange(model.persoonsvorm, {
                          startToken: token.index,
                          endToken: token.index,
                        });

                      return (
                        <Fragment key={token.index}>
                          <button
                            type="button"
                            disabled={!requirePv}
                            onClick={() =>
                              persist(togglePersoonsvorm(value, token.index))
                            }
                            className={cn(
                              "rounded px-0.5 text-sm leading-6",
                              requirePv && "hover:bg-zinc-100",
                              isPv && "underline decoration-2 underline-offset-4",
                              isModelPv && "text-green-800",
                            )}
                            title={requirePv ? t("toggle-pv") : undefined}
                          >
                            {token.text}
                          </button>
                          {token.index < segment.endToken && (
                            <button
                              type="button"
                              onClick={() =>
                                persist(toggleBoundary(value, token.index))
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
                    persist(
                      setSegmentLabel(
                        value,
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
                {reviewMode && modelSegment && modelSegment.label !== segment.label && (
                  <div className="mt-1 text-xs text-green-800">
                    {t("correct-label")}: {modelSegment.label}
                  </div>
                )}
              </div>
              {segment.endToken < value.tokens.length - 1 && (
                <button
                  type="button"
                  onClick={() => persist(toggleBoundary(value, segment.endToken))}
                  className="mx-1 flex w-8 items-center justify-center rounded-md border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-700 hover:text-black"
                  title={t("toggle-boundary")}
                >
                  |
                </button>
              )}
            </div>
          );
        })}
      </div>

      {requirePv && (
        <div className="text-xs text-zinc-500">
          {t("pv-help")}
          {reviewMode && model.persoonsvorm ? (
            <span className="ml-1 text-green-800">
              {t("correct-pv")}:{" "}
              {model.tokens
                .slice(model.persoonsvorm.startToken, model.persoonsvorm.endToken + 1)
                .map((token) => token.text)
                .join(" ")}
            </span>
          ) : null}
        </div>
      )}

      {reviewMode && (
        <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
          <div className="font-semibold text-zinc-900">{t("model-answer")}</div>
          {model.segments.map((segment) => (
            <span key={segment.startToken} className="mr-3 inline-block">
              {segmentText(model, segment)}: {segment.label || "-"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentComponent;
