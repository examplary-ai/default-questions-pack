import { useEffect, useRef, useState } from "react";

import { ChatInput, type FrontendAssessmentComponent } from "@examplary/ui";

import { ChatTranscript } from "./lib/chat-transcript";
import { schema } from "./schema";
import { finalTurnNote, systemPrompt } from "./system-prompt";
import {
  type Chat,
  countAssistantTurns,
  getMaxTurns,
  isFinalTurn,
  resolveTurn,
  transcriptValue,
} from "./shared";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  saveAnswer,
  answer,
  isPreview,
  reviewMode,
  api,
  i18n,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  const maxTurns = getMaxTurns(question.settings);

  const [complete, setComplete] = useState(answer?.completed || false);
  const [chat, setChat] = useState<Chat>(
    () =>
      answer?.context?.chat || [
        {
          role: "system",
          content: systemPrompt(question, i18n?.language),
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
      if (!question.settings?.instructions) return;
      started.current = true;
      nextStep(chat);
    }
  }, []);

  const nextStep = async (newChat: Chat) => {
    if (loading) return;

    setLoading(true);

    // TODO: error handling

    const priorAssistantTurns = countAssistantTurns(newChat);
    const messages: Chat = [...newChat];

    if (messages.length === 1) {
      messages.push({
        role: "user",
        content: "(conversation started)",
        hidden: true,
      });
      newChat = messages.slice();
    }

    // Warn the model that it is about to run out of turns, so it wraps up
    // itself instead of being cut off halfway through a question
    if (isFinalTurn({ priorAssistantTurns, maxTurns })) {
      messages.push({ role: "user", content: finalTurnNote, hidden: true });
    }

    let response;
    try {
      if ((api as any).ai?.generate) {
        // Use new AI API
        response = await (api as any).ai.generate({ messages, schema });
      } else {
        // Or fall back to legacy API
        // TODO: remove after June 2026
        const { data } = await (api as any).post(`/public/exams/conversation`, {
          chat: messages,
        });
        response = data;
      }
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setLoading(false);
    }

    response = resolveTurn(response, { priorAssistantTurns, maxTurns });

    const updatedChat: Chat = [...newChat, { role: "assistant", ...response }];

    setChat(updatedChat);

    if (response.completed) setComplete(true);

    saveAnswer({
      value: transcriptValue(updatedChat),
      context: { chat: updatedChat },
      completed: response.completed,
    });
  };

  const submit = async (message: string) => {
    const newChat: Chat = [...chat, { role: "user", content: message }];
    setChat(newChat);
    nextStep(newChat);
  };

  if (!api) {
    return (
      <div className="bg-red-50 text-red-900 p-5 rounded-lg w-full text-sm text-center">
        {t("error-no-api")}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ChatTranscript messages={chat} typing={loading && !complete} t={t} />

      {complete ? (
        <div
          className="bg-green-100 mt-10 p-4 rounded-xl text-center font-semibold w-full text-sm"
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
            chat.length < 2 ? t("start-placeholder") : t("response-placeholder")
          }
        />
      )}
    </div>
  );
};

export default AssessmentComponent;
