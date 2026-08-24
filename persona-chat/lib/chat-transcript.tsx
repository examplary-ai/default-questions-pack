import {
  ChatTypingIndicator,
  cn,
  RichTextDisplay,
  TickIcon,
} from "@examplary/ui";
import { CheckCircle2Icon } from "lucide-react";

export type TranscriptMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  hidden?: boolean;
  reason?: string;
  criteriaStatus?: string;
  completed?: boolean;
  completionReason?: string;
};

type ChatTranscriptProps = {
  messages: TranscriptMessage[];
  typing?: boolean;
  /** Shows the AI's reasoning under each message (used in the results view) */
  showReasoning?: boolean;
  botAvatar?: string;
  className?: string;
  t?: (key: string) => string;
};

// Deliberately laid out without flexbox and without entrance animations.
// Puppeteer renders result PDFs before CSS animations have finished, so
// `animate-in slide-in-from-top` leaves the bubbles stuck in their translated
// start position and they print on top of each other. Chrome also fragments
// flex containers badly across page breaks. A block flow with an absolutely
// positioned avatar and inline-block bubbles prints exactly as it looks on
// screen.
export const ChatTranscript = ({
  messages,
  typing = false,
  showReasoning = false,
  botAvatar,
  className,
  t,
}: ChatTranscriptProps) => {
  const avatar = botAvatar ? (
    <img
      src={botAvatar}
      alt=""
      className="absolute top-0 left-0 size-7 rounded-full border border-black bg-white"
    />
  ) : (
    <span className="absolute top-0 left-0 flex size-7 items-center justify-center rounded-full border border-black bg-white">
      <TickIcon className="size-4" />
    </span>
  );

  return (
    <div className={cn("w-full", className)}>
      {messages
        .filter(({ role, hidden }) => role !== "system" && !hidden)
        .map((message, index) => {
          const isStudent = message.role === "user";

          return (
            <div
              key={index}
              className={cn(
                "relative mb-3 leading-none break-inside-avoid",
                isStudent ? "text-right" : "pl-10",
              )}
            >
              {isStudent ? null : avatar}

              <div
                className={cn(
                  "inline-block max-w-[85%] border px-4 py-3 align-top text-left text-sm",
                  "rounded-3xl",
                  isStudent
                    ? "rounded-tr-sm border-border bg-white"
                    : "rounded-tl-sm border-transparent bg-chat-background",
                )}
              >
                <RichTextDisplay>{message.content}</RichTextDisplay>
              </div>

              {showReasoning && message.reason ? (
                <div className="mt-1 ml-10 text-left text-xs text-gray-500">
                  <span className="font-semibold">
                    {t ? t("reasoning") : "Reasoning"}:
                  </span>{" "}
                  {message.reason}
                </div>
              ) : null}

              {showReasoning &&
              message.completed &&
              message.completionReason ? (
                <div className="mt-1 ml-10 text-left text-xs text-gray-500">
                  <span className="font-semibold text-emerald-600">
                    <CheckCircle2Icon
                      className="mr-1 -mt-0.5 inline-block size-3"
                      strokeWidth={2.6}
                    />
                    {t ? t("completion-reasoning") : "Completion reason"}:
                  </span>{" "}
                  {message.completionReason}
                </div>
              ) : null}
            </div>
          );
        })}

      {typing ? (
        <div className="relative mb-3 min-h-7 pl-10 print:hidden">
          {avatar}
          <span className="inline-block py-2 align-middle">
            <ChatTypingIndicator />
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default ChatTranscript;
