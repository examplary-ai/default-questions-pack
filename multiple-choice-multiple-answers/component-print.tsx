import { FrontendPrintComponent, RichTextDisplay } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ question }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {(question.settings.options || []).map((option, index) => (
        <div key={index} className="flex gap-2 items-center w-full">
          <div className="aspect-square size-5 rounded-sm border-2 border-border" />
          <RichTextDisplay className="flex-1">{option.value}</RichTextDisplay>
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
