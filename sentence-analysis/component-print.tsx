import { AnswerBox } from "@examplary/ui";
import type { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({
  answerBoxes,
  question,
  t,
}) => {
  const raw =
    question.settings.sentence || question.settings.correctAnswer?.raw || "";

  return (
    <div>
      <div className="text-base font-medium">{raw}</div>
      <div className="text-sm text-zinc-500 mt-4">
        {t("print-instructions")}
      </div>
      {answerBoxes && (
        <AnswerBox
          style={{ minHeight: "8rem" }}
          className="mt-2 min-h-[8rem]"
        />
      )}
    </div>
  );
};

export default PrintComponent;
