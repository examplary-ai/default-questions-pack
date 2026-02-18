import { FrontendResultsComponent } from "@examplary/ui";
import "mathlive";

const ResultsComponent: FrontendResultsComponent = ({ answer }) => {
  if (!answer.value) return null;

  return (
    // @ts-expect-error math-span
    <math-span>{answer.value}</math-span>
  );
};

export default ResultsComponent;
