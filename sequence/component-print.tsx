import {
  AnswerBox,
  FrontendPrintComponent,
  RichTextDisplay,
} from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes, question }) => {
  const shuffledOptions = [...(question.settings.options || [])].sort(
    () => 0.5 - Math.random()
  );

  return (
    <div className="space-y-2">
      {shuffledOptions.map((option, index) => (
        <div
          className="border border-black rounded-md p-2 px-3 flex items-center gap-2 text-sm"
          key={index}
        >
          <span className="font-medium text-sm">{index + 1}.</span>
          <RichTextDisplay>{option}</RichTextDisplay>
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
