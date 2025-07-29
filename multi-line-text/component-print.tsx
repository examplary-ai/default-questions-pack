import { AnswerBox, FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes }) => {
  if (!answerBoxes) return null;

  return <AnswerBox style={{ minHeight: "8rem" }} />;
};

export default PrintComponent;
