import {
  AnswerBox,
  cn,
  FrontendPrintComponent,
  RichTextDisplay,
} from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes, question }) => {
  const text = question.settings.text || "";

  const places = text.split("___");

  const output = [];
  for (const place of places) {
    if (output.length) {
      if (answerBoxes) {
        output.push(
          <span className="border border-black h-7 print-no-break w-40 inline-flex -mb-2 mx-1" />,
        );
      } else {
        output.push(<span className="font-semibold">_______</span>);
      }
    }
    output.push(<RichTextDisplay as="span">{place}</RichTextDisplay>);
  }

  return (
    <div className={cn("mt-2", answerBoxes ? "leading-[28px]" : "")}>
      {output}
    </div>
  );
};

export default PrintComponent;
