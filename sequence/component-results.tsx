import { FrontendResultsComponent, RichTextDisplay } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ question, answer }) => {
  if (!answer.value) return null;

 return (
    <div className="space-y-2">
      {answer.value.map((option, index) => (
        <div
          className="border border-border rounded-4xl p-2 px-3 flex items-center gap-2 text-sm"
          key={index}
        >
          <span className="font-medium text-sm">{index + 1}.</span>
          <RichTextDisplay>{option}</RichTextDisplay>
        </div>
      ))}
    </div>
  );
};

export default ResultsComponent;
