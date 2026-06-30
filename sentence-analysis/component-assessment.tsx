import type { FrontendAssessmentComponent } from "@examplary/ui";
import { useMemo } from "react";

import ParseEditor from "./lib/parse-editor";

import {
  DEFAULT_LABELS,
  answerValueToParse,
  isComplete,
  normalizeParse,
  parseToAnswerValue,
  segmentText,
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
      <ParseEditor
        parse={value}
        enabledLabels={enabledLabels}
        requirePersoonsvorm={requirePv}
        onChange={persist}
        t={t}
        reviewParse={reviewMode ? model : undefined}
      />

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
