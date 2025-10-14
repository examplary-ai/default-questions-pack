import { FrontendResultsComponent } from "@examplary/ui";
import { FileIcon } from "lucide-react";

const ResultsComponent: FrontendResultsComponent = ({ question, answer }) => {
  if (!answer.value) return null;

  return (
    <div className="flex gap-2 items-center">
      <FileIcon className="size-6 text-zinc-500" />
      <a
        href={answer.value[0]}
        target="_blank"
        className="text-blue-500 font-medium"
      >
        {answer.value[1]}
      </a>
    </div>
  );
};

export default ResultsComponent;
