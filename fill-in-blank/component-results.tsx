import { FrontendResultsComponent } from "@examplary/ui";

import { BlankText } from "./shared";

const ResultsComponent: FrontendResultsComponent = ({ question, answer }) => {
  if (!answer.value) return null;

  const value = (answer?.value as string[]) || [];

  return (
    <BlankText
      text={question.settings.text || ""}
      renderBlank={(index) => (
        <span className="p-1 px-2 bg-accent rounded-lg font-medium">
          {value[index] || "___"}
        </span>
      )}
    />
  );
};

export default ResultsComponent;
