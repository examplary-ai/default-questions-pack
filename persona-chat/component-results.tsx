import { type FrontendResultsComponent } from "@examplary/ui";

import { ChatTranscript, type TranscriptMessage } from "./lib/chat-transcript";

const ResultsComponent: FrontendResultsComponent = ({ answer, t }) => {
  if (!answer.context?.chat)
    return (
      <span className="text-zinc-500 bg-zinc-100 rounded p-1 px-2 font-medium text-sm">
        {t("empty-answer")}
      </span>
    );

  return (
    <ChatTranscript
      messages={answer.context.chat as TranscriptMessage[]}
      showReasoning
      t={t}
    />
  );
};

export default ResultsComponent;
