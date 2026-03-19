import { AnswerBox, FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ question, t, answerBoxes }) => {
  if (!answerBoxes) return null;

  const initialLines = (question.settings?.initialLines as number) || 6;
  const prefix = (question.settings?.prefix as string) || "";

  return (
    <div className="border border-gray-300 rounded">
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-gray-300 bg-gray-50">
        <span className="font-semibold text-sm">{t("calculation")}</span>
      </div>

      {/* Empty lines for writing */}
      {Array.from({ length: initialLines }).map((_, i) => (
        <div
          key={i}
          className="border-b border-gray-200 min-h-[2rem] px-3"
        />
      ))}

      {/* Answer row */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-300 bg-gray-50">
        <span className="font-semibold text-sm">{t("answer")}</span>
        {prefix && <span className="text-sm">{prefix}</span>}
        <AnswerBox />
      </div>
    </div>
  );
};

export default PrintComponent;
