import {
  ChatView,
  cn,
  FrontendResultsComponent,
  RichTextDisplay,
} from "@examplary/ui";
import { BotIcon, CheckCircle2Icon, SparkleIcon, UserIcon } from "lucide-react";

type Chat = {
  role: "user" | "assistant" | "system";
  hidden?: boolean;
  content: string;
  reason?: string;
  completed?: boolean;
  completionReason?: string;
}[];

const ResultsComponent: FrontendResultsComponent = ({ answer, t }) => {
  if (!answer.context?.chat)
    return (
      <span className="text-zinc-500 bg-zinc-100 rounded p-1 px-2 font-medium text-sm">
        {t("empty-answer")}
      </span>
    );

  return (
    <div className="flex flex-col gap-3">
      {(answer.context.chat as Chat)
        .filter(({ role, hidden }) => role !== "system" && !hidden)
        .map((item, index) => (
          <div key={index}>
            <div className="flex gap-3">
              <div>
                {item.role === "user" ? (
                  <UserIcon className="size-4" />
                ) : (
                  <BotIcon className="size-4" />
                )}
              </div>
              <div
                className={cn(
                  "flex-1 text-sm border rounded-3xl rounded-tl-sm px-4 py-3",
                  "animate-in slide-in-from-top",
                  item.role === "user" &&
                    "border-transparent bg-chat-background",
                  item.role !== "user" &&
                    "bg-white border-border text-zinc-700",
                )}
              >
                <RichTextDisplay>{item.content}</RichTextDisplay>
              </div>
            </div>
            {item.reason ? (
              <div
                key={`reason-${index}`}
                className={cn("text-xs text-gray-500 mb-1 ml-7 mt-1")}
              >
                <span className="font-semibold">{t("reasoning")}:</span>{" "}
                {item.reason}
              </div>
            ) : null}
            {item.completed && item.completionReason ? (
              <div className={cn("text-xs text-gray-500 mb-1 ml-7")}>
                <span className="font-semibold text-emerald-600">
                  <CheckCircle2Icon
                    className="size-3 -mt-0.5 inline-block mr-1"
                    strokeWidth={2.6}
                  />
                  {t("completion-reasoning")}:
                </span>{" "}
                {item.completionReason}
              </div>
            ) : null}
          </div>
        ))}
    </div>
  );
};

export default ResultsComponent;
