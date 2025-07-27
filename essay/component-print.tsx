import { AnswerBox, FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes }) => {
  if (!answerBoxes) return null;

  return <AnswerBox style={{ height: "75vh", minHeight: "16rem" }} />;
};

export default PrintComponent;
