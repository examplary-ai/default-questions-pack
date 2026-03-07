import { FrontendPrintComponent, RichTextDisplay } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ question, answerBoxes }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {(question.settings.options || []).map(
        (option: string, index: number) => (
          <div key={index} className="flex gap-2 items-center w-full">
            {answerBoxes ? (
              <div className="aspect-square size-5 rounded-full border border-black" />
            ) : (
              <span>{String.fromCharCode(65 + index)}.</span>
            )}
            <RichTextDisplay className="flex-1">{option}</RichTextDisplay>
          </div>
        ),
      )}
    </div>
  );
};

export default PrintComponent;
