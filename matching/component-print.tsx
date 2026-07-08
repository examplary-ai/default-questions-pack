import { cn, FrontendPrintComponent, RichTextDisplay } from "@examplary/ui";
import { useMemo } from "react";

import { getMatchingData, orderOptions } from "./shared";

const PrintComponent: FrontendPrintComponent = ({
  answerBoxes,
  question,
  t,
}) => {
  const { left, right } = useMemo(
    () => getMatchingData(question.settings),
    [question],
  );

  const horizontal =
    question.settings.layout === "horizontal" && left.length <= 4;

  const leftItems = useMemo(() => {
    const labels = left.map((option) => option.label);
    if (question.settings.shuffle) {
      return labels.sort(() => 0.5 - Math.random());
    }
    return labels;
  }, [left]);

  const rightItems = useMemo(
    () =>
      orderOptions(right, question.settings.shuffle).map(
        (option) => option.label,
      ),
    [right],
  );

  if (!answerBoxes) {
    return (
      <div className="flex flex-col gap-2 mt-2 break-inside-avoid">
        {leftItems.map((option, index) => (
          <div key={index} className="flex gap-2 items-center w-full">
            <span className="font-medium">{index + 1}.</span>
            <RichTextDisplay>{option}</RichTextDisplay>
          </div>
        ))}
        <p className="mt-6 mb-2 font-bold">{t("possible-answers")}</p>
        {rightItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-center w-full">
            <span className="font-medium">
              {String.fromCharCode(65 + index)}.
            </span>
            <RichTextDisplay>{item}</RichTextDisplay>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={cn("flex flex-col gap-3", horizontal && "md:flex-row!")}>
        {leftItems.map((option, index) => (
          <div
            className={cn(
              "flex items-center",
              horizontal && "flex-1 md:flex-col",
            )}
            data-type="matching-option"
          >
            <div
              className="flex-1 w-full border border-black p-2 px-3 min-w-10 min-h-10 overflow-hidden"
              key={index}
            >
              <RichTextDisplay>{option}</RichTextDisplay>
            </div>
            <div
              className={
                !horizontal ? "h-0.25 w-5 bg-black" : "w-0.25 h-5 bg-black"
              }
            />
            <div className="flex-1 w-full border border-black border-dashed p-2 px-3 min-w-10 min-h-10" />
          </div>
        ))}
      </div>
      <p className="mt-6 mb-2">{t("possible-answers")}</p>
      <div className="flex flex-wrap items-start justify-start gap-2">
        {rightItems.map((item, index) => (
          <div
            className="border border-black p-2 px-3 min-w-10 min-h-10 overflow-hidden"
            key={index}
          >
            <RichTextDisplay>{item}</RichTextDisplay>
          </div>
        ))}
      </div>
    </>
  );
};

export default PrintComponent;
