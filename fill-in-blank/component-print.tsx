import { cn, FrontendPrintComponent } from "@examplary/ui";

import { BlankText } from "./shared";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes, question }) => (
  <BlankText
    className={cn("mt-2", answerBoxes ? "leading-[28px]" : "")}
    text={question.settings.text || ""}
    renderBlank={() =>
      answerBoxes ? (
        <span className="border border-black h-7 print-no-break w-40 inline-flex -mb-2 mx-1" />
      ) : (
        <span className="font-semibold">_______</span>
      )
    }
  />
);

export default PrintComponent;
