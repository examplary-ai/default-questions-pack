import {
  AnswerBox,
  cn,
  FrontendPrintComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { useMemo } from "react";

import type { Item } from "./component-settings-area";

const PrintComponent: FrontendPrintComponent = ({ question, t }) => {
  const horizontal =
    question.settings.layout === "horizontal" &&
    question.settings.options?.length! <= 4;
  const leftItems = useMemo(() => {
    const items = question.settings.options?.map((pair: Item) => pair[0]) || [];
    if (question.settings.shuffle) {
      return items.sort(() => 0.5 - Math.random());
    }
    return items;
  }, [question]);

  const rightItems = useMemo(() => {
    const items = question.settings.options?.map((pair: Item) => pair[1]) || [];
    return items.sort(() => 0.5 - Math.random());
  }, [question]);

  return (
    <>
      <div className={cn("flex flex-col gap-3", horizontal && "md:flex-row!")}>
        {leftItems.map((option, index) => (
          <div
            className={cn(
              "flex items-center",
              horizontal && "flex-1 md:flex-col"
            )}
            data-type="matching-option"
          >
            <div
              className="flex-1 w-full border border-black rounded-xl p-2 px-3 text-sm min-w-10 min-h-10 overflow-hidden"
              key={index}
            >
              <RichTextDisplay>{option}</RichTextDisplay>
            </div>
            <div
              className={
                !horizontal ? "h-0.25 w-5 bg-black" : "w-0.25 h-5 bg-black"
              }
            />
            <div className="flex-1 w-full border border-black border-dashed rounded-xl p-2 px-3 min-w-10 min-h-10" />
          </div>
        ))}
      </div>
      <p className="mt-6 mb-2 text-sm">{t("possible-answers")}</p>
      <div className="flex flex-wrap items-start justify-start gap-2">
        {rightItems.map((item, index) => (
          <div
            className="border border-black rounded-xl p-2 px-3 text-sm min-w-10 min-h-10 overflow-hidden"
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
