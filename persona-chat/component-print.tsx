import { AnswerBox, type FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes }) => {
  if (!answerBoxes) return null;

  return <AnswerBox />;
};

export default PrintComponent;
