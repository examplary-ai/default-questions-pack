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
            <div className="flex-1 w-full border border-border rounded-xl p-1.5 px-3 text-sm overflow-hidden">
              <RichTextDisplay>{left}</RichTextDisplay>
            </div>
            <div className="h-0.25 w-5 bg-border" />
            <div
              className={cn(
                "flex-1 w-full border border-border rounded-xl p-1.5 px-3 text-sm overflow-hidden",
                incorrect && "bg-red-100 border-red-100",
              )}
            >
              <RichTextDisplay>{right}</RichTextDisplay>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsComponent;
