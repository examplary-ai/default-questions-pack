import type { FrontendResultsComponent } from "@examplary/ui";

import ParseEditor from "./lib/parse-editor";
import {
  answerValueToParse,
  DEFAULT_LABELS,
  normalizeParse,
} from "./shared";
import type { SentenceParse, ZinsdeelCode } from "./shared";

const ResultsComponent: FrontendResultsComponent = ({ question, answer, t }) => {
  if (!answer.value) return null;

  const raw = question.settings.sentence || question.settings.correctAnswer?.raw || "";
  const enabledLabels =
    (question.settings.enabledLabels as ZinsdeelCode[]) || DEFAULT_LABELS;
  const requirePv = question.settings.requirePersoonsvorm !== false;
  const student = normalizeParse(
    raw,
    (answer.context?.parse as Partial<SentenceParse> | undefined) ||
      answerValueToParse(raw, answer.value),
  );
  const model = normalizeParse(raw, question.settings.correctAnswer);

  return (
    <div className="space-y-3">
      <ParseEditor
        parse={student}
        enabledLabels={enabledLabels}
        requirePersoonsvorm={requirePv}
        t={t}
        reviewParse={model}
        readOnly
      />
    </div>
  );
};

export default ResultsComponent;
