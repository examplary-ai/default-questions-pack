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
    [question.id],
  );

  if (!answerBoxes) {
    return (
      <div className="flex flex-col gap-2 mt-2 break-inside-avoid">
        {shuffledOptions.map((option, index) => (
          <div key={index} className="flex gap-2 items-center w-full">
            <span className="font-medium">{index + 1}.</span>
            <RichTextDisplay>{option}</RichTextDisplay>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {shuffledOptions.map((option, index) => (
        <div
          className="border border-black flex items-center gap-2"
          key={index}
        >
          <RichTextDisplay className="ml-8 border-black border-l h-full p-1.5 px-2 min-h-8">
            {option}
          </RichTextDisplay>
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
