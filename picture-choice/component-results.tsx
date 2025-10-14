import { FrontendResultsComponent } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ answer }) => {
  if (!answer.value) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
      <img
        src={answer.value as string}
        alt={answer.value as string}
        className="max-w-sm max-h-30 object-contain rounded-lg border border-border group-hover:border-blue-300 transition"
      />
    </div>
  );
};

export default ResultsComponent;
