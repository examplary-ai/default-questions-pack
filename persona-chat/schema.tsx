/**
 * Response schema for one AI turn.
 *
 * The property order matters: the model fills the fields in order, so it has
 * to weigh the criteria and commit to `completed` *before* it writes the
 * message. That is what keeps it from asking a follow-up question in the very
 * message that closes the conversation.
 */
export const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    reason: {
      type: "string",
      description:
        "Why you are replying with this message: what does it serve in the conversation, in one sentence?",
    },
    criteriaStatus: {
      type: "string",
      description:
        "Which parts of the teacher's instructions the student has already demonstrated, and which are still missing. One or two sentences.",
    },
    completed: {
      type: "boolean",
      description:
        "True only if this is your final message: everything the instructions ask for has been covered, or your message budget is used up. If your message contains a question, this must be false.",
    },
    completionReason: {
      type: "string",
      description:
        "Why you are ending the conversation, or - if completed is false - what still needs to happen before you can end it.",
    },
    content: {
      type: "string",
      description:
        "The message the student sees. When completed is false it ends with exactly one question. When completed is true it is a closing remark that contains no question and does not invite a reply.",
    },
  },
  required: [
    "reason",
    "criteriaStatus",
    "completed",
    "completionReason",
    "content",
  ],
  additionalProperties: false,
};
