import { FrontendResultsComponent, RichTextDisplay } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ answer }) => {
  if (!answer.value) return null;

  return (
    <div className="flex flex-col gap-2">
      {answer.value?.map((option: string, index: number) => {
        const [left, right] = option.split(" = ", 2);
        return (
          <div className="flex items-center" key={index}>
            <div className="flex-1 w-full border border-border rounded-xl p-1.5 px-3 text-sm overflow-hidden">
              <RichTextDisplay>{left}</RichTextDisplay>
            </div>
            <div className="h-0.25 w-5 bg-border" />
            <div className="flex-1 w-full border border-border rounded-xl p-1.5 px-3 text-sm overflow-hidden">
              <RichTextDisplay>{right}</RichTextDisplay>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsComponent;
