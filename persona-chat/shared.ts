import { getPersona, localized } from "./personas";
import type { TranscriptMessage } from "./lib/chat-transcript";

export type Chat = TranscriptMessage[];

export type AiTurn = {
  content: string;
  reason?: string;
  criteriaStatus?: string;
  completed?: boolean;
  completionReason?: string;
};

export const defaultMaxTurns = 10;

export const getMaxTurns = (settings?: Record<string, any>) =>
  Number(settings?.maxTurns) || defaultMaxTurns;

/** Rough text content of a rich text value, good enough for length checks. */
export const stripHtml = (html?: string) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Whether an AI message still asks the student something. */
export const containsQuestion = (content?: string) =>
  /[?¿]/.test(stripHtml(content));

/**
 * Reconciles what the model said with the turn budget.
 *
 * Two things go wrong without this: the model closes the conversation in a
 * message that still asks a question (the student sees the question but the
 * input is already gone), and the front-end cuts the conversation off at the
 * turn limit halfway through a question.
 */
export const resolveTurn = (
  turn: AiTurn,
  {
    priorAssistantTurns,
    maxTurns,
  }: { priorAssistantTurns: number; maxTurns: number },
): AiTurn => {
  // This message is the last one that fits in the budget, so it always closes
  // the conversation - the model is told about this up front (see finalTurnNote)
  if (priorAssistantTurns + 1 >= maxTurns) {
    return {
      ...turn,
      completed: true,
      completionReason: turn.completionReason || "maxTurns",
    };
  }

  // The model wants to stop but is still asking something: let the student
  // answer, and let the model close the conversation on its next turn
  if (turn.completed && containsQuestion(turn.content)) {
    return { ...turn, completed: false };
  }

  return turn;
};

/** Whether the model should be told to wrap up in this turn. */
export const isFinalTurn = ({
  priorAssistantTurns,
  maxTurns,
}: {
  priorAssistantTurns: number;
  maxTurns: number;
}) => priorAssistantTurns + 1 >= maxTurns;

export const countAssistantTurns = (chat: Chat) =>
  chat.filter((message) => message.role === "assistant").length;

/**
 * The transcript that gets stored as the answer value and handed to the AI
 * grader. Documented in the `grading.instructions` of question-type.yml.
 */
export const transcriptValue = (chat: Chat) =>
  chat
    .filter(({ role, hidden }) => role !== "system" && !hidden)
    .map(
      ({ role, content }) =>
        `<div><b>${role === "user" ? "student" : "assistant"}:</b> ${content}</div>`,
    )
    .join("\n");

/**
 * Messages for the "Improve with AI" button in the settings area: the teacher
 * has started writing instructions and the AI completes them into a full
 * scenario plus completion criteria.
 */
export const improveInstructionsMessages = (
  question: any,
  settings: Record<string, any>,
  language?: string,
) => {
  const persona = getPersona(settings?.persona);

  return [
    {
      role: "system" as const,
      content: `You help a teacher finish the instructions for a "Persona chat" exam question, in which an AI plays a character and holds a conversation with a student. The transcript is graded afterwards.

The instructions you produce are read by the AI character, not by the student, and must contain both:
1. The scenario: the situation, the topic and what the character should get the student to do.
2. The completion criteria: what the student has to have shown before the conversation may be ended.

Rules:
- Build on what the teacher already wrote. Keep their intent, their subject matter, their level and their wording where you can; you complete their draft, you don't replace it.
- Write in the same language as the teacher's draft.
- Do not repeat the character description: the character is already "${localized(persona.title, language)}".
- Do not address the student and do not write example dialogue.
- Be concrete and short: a few sentences for the scenario, then the criteria as an HTML list.
- Return HTML using only <p>, <ul>, <li>, <strong> and <em>. No headings, no markdown, no code fences.`,
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        questionTitle: question?.title || "",
        questionDescription: question?.description || "",
        character: localized(persona.title, language),
        maxMessages: getMaxTurns(settings),
        teacherDraft: settings?.instructions || "",
      }),
    },
  ];
};

export const improveInstructionsSchema = {
  type: "object",
  properties: {
    instructions: {
      type: "string",
      description:
        "The completed instructions as HTML: the scenario first, then the completion criteria as a <ul> list.",
    },
  },
  required: ["instructions"],
};
