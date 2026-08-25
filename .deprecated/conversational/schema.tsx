export const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    reason: {
      type: "string",
      description:
        "The reason why you as a teacher would reply to the student with this message - what didactic purpose does this serve in regards to the scoring criteria?",
    },
    completed: {
      type: "boolean",
      description:
        "Whether the assessment criteria have been completed. If true, the conversation is considered complete.",
    },
    completionReason: {
      type: "string",
      description:
        "The reason why you've decided to conclude the conversation.",
    },
    content: {
      type: "string",
      description: "The next message in the conversation.",
    },
  },
  required: ["reason", "completed", "completionReason", "content"],
  additionalProperties: false,
};
