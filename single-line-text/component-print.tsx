import { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ answerBoxes }) => {
  if (!answerBoxes) return null;

  return <div className="box h-12 print-no-break" />;
};

export default PrintComponent;
