import { ChatView, FrontendResultsComponent } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ answer, t }) => {
  if (!answer.context?.chat)
    return (
      <span className="text-zinc-500 bg-zinc-100 rounded p-1 px-2 font-medium text-sm">
        {t("empty-answer")}
      </span>
    );

  return <ChatView messages={answer.context.chat} showTeacherContext />;
};

export default ResultsComponent;
