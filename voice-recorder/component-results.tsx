import { FrontendResultsComponent } from "@examplary/ui";

type AudioAnswerValue = [string, string, string?, string?];

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const ResultsComponent: FrontendResultsComponent = ({ answer, t }) => {
  if (!Array.isArray(answer.value))
    return (
      <span className="text-zinc-500 bg-zinc-100 rounded p-1 px-2 font-medium text-sm">
        {t("empty-answer")}
      </span>
    );

  const value = answer.value as AudioAnswerValue;

  return (
    <div className="min-w-64 flex-1">
      <a href={value[0]} target="_blank" className="text-blue-500 font-medium">
        {value[1] || t("recorded-answer")}
      </a>
      {value[3] ? (
        <span className="ml-2 text-sm text-zinc-500">
          {formatDuration(Number(value[3]))}
        </span>
      ) : null}
      <audio controls src={value[0]} className="mt-2 w-full max-w-128" />
    </div>
  );
};

export default ResultsComponent;
