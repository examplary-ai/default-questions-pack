import { cn } from "@examplary/ui";
import type { FrontendResultsComponent } from "@examplary/ui";

import {
  answerValueToParse,
  normalizeParse,
  sameRange,
  segmentText,
} from "./shared";
import type { SentenceParse } from "./shared";

const ResultsComponent: FrontendResultsComponent = ({ question, answer, t }) => {
  if (!answer.value) return null;

  const raw = question.settings.sentence || question.settings.correctAnswer?.raw || "";
  const student = normalizeParse(
    raw,
    (answer.context?.parse as Partial<SentenceParse> | undefined) ||
      answerValueToParse(raw, answer.value),
  );
  const model = normalizeParse(raw, question.settings.correctAnswer);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {student.segments.map((segment) => {
          const modelSegment = model.segments.find(
            (item) =>
              item.startToken === segment.startToken &&
              item.endToken === segment.endToken,
          );
          const correct = modelSegment?.label === segment.label;
          return (
            <div
              key={segment.startToken}
              className={cn(
                "rounded-lg border border-border px-3 py-2 text-sm",
                correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
              )}
            >
              <div>{segmentText(student, segment)}</div>
              <div className="mt-1 text-xs font-semibold">
                {segment.label || t("no-label")}
              </div>
              {!correct && modelSegment ? (
                <div className="text-xs text-green-800">
                  {t("correct-label")}: {modelSegment.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {question.settings.requirePersoonsvorm !== false && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            sameRange(student.persoonsvorm, model.persoonsvorm)
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50",
          )}
        >
          <span className="font-semibold">{t("persoonsvorm")}:</span>{" "}
          {student.persoonsvorm
            ? student.tokens
                .slice(student.persoonsvorm.startToken, student.persoonsvorm.endToken + 1)
                .map((token) => token.text)
                .join(" ")
            : t("no-pv")}
          {!sameRange(student.persoonsvorm, model.persoonsvorm) &&
          model.persoonsvorm ? (
            <span className="ml-2 text-green-800">
              {t("correct-pv")}:{" "}
              {model.tokens
                .slice(model.persoonsvorm.startToken, model.persoonsvorm.endToken + 1)
                .map((token) => token.text)
                .join(" ")}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResultsComponent;
