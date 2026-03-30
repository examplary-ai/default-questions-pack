import { cn, FrontendResultsComponent, RichTextDisplay } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ answer, question }) => {
  if (!answer.value) return null;

  if (typeof answer.value === "string") {
    return <RichTextDisplay>{answer.value}</RichTextDisplay>;
  }

  return (
    <div className="flex flex-col gap-2">
      {answer.value?.map?.((option: string, index: number) => {
        const [left, right] = option.split(" = ", 2);
        const incorrect =
          question.settings?.correctAnswer &&
          !question.settings.correctAnswer.includes(option);

        return (
          <div className="flex items-center" key={index}>
            <div className="flex-1 w-full border border-border print:border-black rounded-xl p-1.5 px-3 text-sm overflow-hidden">
              <RichTextDisplay>{left?.replace(/\\=/g, "=")}</RichTextDisplay>
            </div>
            <div className="h-0 w-5 border-t border-border print:border-black" />
            <div
              className={cn(
                "flex-1 w-full border border-border print:border-black rounded-xl p-1.5 px-3 text-sm overflow-hidden",
                incorrect && "bg-red-100 border-red-100",
              )}
            >
              <RichTextDisplay>{right?.replace(/\\=/g, "=")}</RichTextDisplay>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsComponent;
