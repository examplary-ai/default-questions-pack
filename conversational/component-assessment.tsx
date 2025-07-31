import { useEffect, useRef, useState } from "react";

import {
  ChatInput,
  ChatView,
  FrontendAssessmentComponent,
} from "@examplary/ui";
import { systemPrompt } from "./system-prompt";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  saveAnswer,
  answer,
  isPreview,
  api,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const [complete, setComplete] = useState(answer?.completed || false);
  const [chat, setChat] = useState(
    () =>
      answer?.context?.chat || [
        {
          role: "system",
          content: systemPrompt(question),
        },
      ]
  );

  // Auto-start the conversation if the AI is set to start
  useEffect(() => {
    if (question.settings?.aiStarts) {
      if (started.current) return;
      started.current = true;
      nextStep(chat);
    }
  }, []);

  const nextStep = async (newChat) => {
    if (loading) return;

    setLoading(true);

    const { data } = await api.post(`/public/exams/conversation`, {
      chat: newChat,
    });

    setLoading(false);

    if (
      !data.completed &&
      newChat.filter((m) => m.role === "assistant").length >=
        question.settings.maxTurns
    ) {
      data.completed = true;
      data.completionReason = "maxTurns";
    }

    newChat.push({
      role: "assistant",
      ...data,
    });

    setChat(newChat);

    if (data.completed) setComplete(true);

    saveAnswer({
      value: newChat
        .filter((m) => m.role !== "system")
        .map((m) => `<p>${m.role}: ${m.content}</p>`)
        .join("\n"),
      context: { chat: newChat },
      completed: data.completed,
    });
  };

  const submit = async (message) => {
    const newChat = [...chat, { role: "user", content: message }];
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
            className="bg-green-100 border-2 mt-10 p-4 rounded-lg w-full text-sm"
            key="done"
          >
            <div className="bg-green-100 border-2 mt-10 p-4 rounded-lg w-full text-sm">
              {t("completed")}
            </div>
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
