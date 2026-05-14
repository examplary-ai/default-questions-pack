import { useEffect, useRef, useState } from "react";

import {
  ChatInput,
  ChatView,
  FrontendAssessmentComponent,
} from "@examplary/ui";
import { systemPrompt } from "./system-prompt";
import { schema } from "./schema";

type Chat = {
  role: "system" | "user" | "assistant";
  content: string;
  hidden?: boolean;
}[];

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  saveAnswer,
  answer,
  isPreview,
  reviewMode,
  api,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const [complete, setComplete] = useState(answer?.completed || false);
  const [chat, setChat] = useState<Chat>(
    () =>
      answer?.context?.chat || [
        {
          role: "system",
          content: systemPrompt(question),
        },
      ],
  );

  // Auto-start the conversation if the AI is set to start
  useEffect(() => {
    if (
      question.settings?.aiStarts &&
      chat.length === 1 &&
      !complete &&
      !reviewMode
    ) {
      if (started.current) return;
      if (!question.settings?.conversationalPrompt) return;
      started.current = true;
      nextStep(chat);
    }
  }, []);

  const nextStep = async (newChat: Chat) => {
    if (loading) return;

    setLoading(true);

    // TODO: error handling

    let response;
    if ("ai" in api) {
      // Use new AI API
      if (newChat.length === 1) {
        newChat.push({
          role: "user",
          content: "(conversation started)",
          hidden: true,
        });
      }
      response = await api.ai.generate({
        messages: newChat,
        schema,
      });
    } else {
      // Or fall back to legacy API
      // TODO: remove after June 2026
      const { data } = await api.post(`/public/exams/conversation`, {
        chat: newChat,
      });
      response = data;
    }

    setLoading(false);

    if (
      !response.completed &&
      newChat.filter((m) => m.role === "assistant").length >=
        question.settings.maxTurns
    ) {
      response.completed = true;
      response.completionReason = "maxTurns";
    }

    newChat.push({
      role: "assistant",
      ...response,
    });

    setChat(newChat);

    if (response.completed) setComplete(true);

    saveAnswer({
      value: newChat
        .filter((m) => m.role !== "system")
        .map((m) => `<p>${m.role}: ${m.content}</p>`)
        .join("\n"),
      context: { chat: newChat },
      completed: response.completed,
    });
  };

  const submit = async (message: string) => {
    const newChat: Chat = [...chat, { role: "user", content: message }];
    setChat(newChat);
    nextStep(newChat);
  };

  return (
    <>
      <div className="flex flex-col w-full gap-2 items-start">
        <ChatView
          messages={chat}
          typing={loading && !complete}
          className="w-full"
        />

        {complete ? (
          <div
            className="bg-green-100 border border-green-400 mt-10 p-4 rounded-lg w-full text-sm"
            key="done"
          >
            {t("completed")}
          </div>
        ) : (
          <ChatInput
            loading={loading}
            submit={submit}
            autoFocus={!isPreview}
            placeholder={
              chat.length < 2
                ? t("start-placeholder")
                : t("response-placeholder")
            }
          />
        )}
      </div>
    </>
  );
};

export default AssessmentComponent;
