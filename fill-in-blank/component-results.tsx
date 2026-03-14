import { FrontendResultsComponent } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ question, answer }) => {
  if (!answer.value) return null;

  const text = question.settings.text || "";
  const value = (answer?.value as string[]) || [];

  const places = text.split("___");

  return (
    <div>
      {places.map((place, index) => (
        <span key={index}>
          {index > 0 && (
            <span className="p-1 px-2 bg-accent rounded-lg">
              {value[index - 1] || "___"}
            </span>
          )}
          <span>{place}</span>
        </span>
      ))}
    </div>
  );
};

export default ResultsComponent;
