import {
  AnswerBox,
  FrontendPrintComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { useMemo } from "react";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes, question }) => {
  const shuffledOptions = useMemo(
    () =>
      [...(question.settings.options || [])].sort(() => 0.5 - Math.random()),
    [question.id]
  );

  return (
    <div className="space-y-2">
      {shuffledOptions.map((option, index) => (
        <div
          className="border border-black p-1.5 px-2 flex items-center gap-2"
          key={index}
        >
          <span className="font-medium">{index + 1}.</span>
          <RichTextDisplay>{option}</RichTextDisplay>
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
