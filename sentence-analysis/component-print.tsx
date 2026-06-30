import { AnswerBox } from "@examplary/ui";
import type { FrontendPrintComponent } from "@examplary/ui";

import { normalizeParse } from "./shared";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes, question, t }) => {
  const raw = question.settings.sentence || question.settings.correctAnswer?.raw || "";
  const parse = normalizeParse(raw, question.settings.correctAnswer);

  if (!answerBoxes) {
    return (
      <div className="space-y-2">
        <div className="text-base">{raw}</div>
        <div className="flex flex-wrap gap-2">
          {parse.segments.map((segment) => (
            <div
              key={segment.startToken}
              className="min-w-20 border border-black px-2 py-1 text-sm"
            >
              {parse.tokens
                .slice(segment.startToken, segment.endToken + 1)
                .map((token) => token.text)
                .join(" ")}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-base">{raw}</div>
      <div className="mb-1 text-sm text-zinc-500">{t("print-instructions")}</div>
      <AnswerBox style={{ minHeight: "8rem" }} />
    </div>
  );
};

export default PrintComponent;
