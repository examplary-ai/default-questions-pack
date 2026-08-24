import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderAssessment } from "../.tests/render-assessment";
import AssessmentComponent from "./component-assessment";

const settings = {
  persona: "knowledge-examiner",
  instructions:
    "<p>Discuss photosynthesis. Done once sunlight is explained.</p>",
  maxTurns: 3,
  aiStarts: false,
};

/** An api stub whose AI answers with the queued turns, in order */
const aiApi = (turns: any[]) => {
  const generate = vi.fn(async () =>
    turns.length > 1 ? turns.shift() : turns[0],
  );
  return { api: { ai: { generate } }, generate };
};

const say = (text: string) => {
  const input = document.querySelector("textarea") as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: "Enter" });
};

const messagesOf = (generate: any, call = 0) =>
  generate.mock.calls[call][0].messages;

describe("conversation flow", () => {
  it("sends the system prompt and stores the transcript", async () => {
    const { api, generate } = aiApi([
      { content: "<p>Why does a plant need light?</p>", completed: false },
    ]);
    const harness = renderAssessment(AssessmentComponent, { settings, api });

    say("Because of photosynthesis.");

    await waitFor(() => expect(generate).toHaveBeenCalled());

    const messages = messagesOf(generate);
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("Discuss photosynthesis");
    expect(messages[0].content).toContain("Knowledge examiner");

    await waitFor(() =>
      expect(harness.lastSaved()?.value).toBe(
        "<div><b>student:</b> Because of photosynthesis.</div>\n" +
          "<div><b>assistant:</b> <p>Why does a plant need light?</p></div>",
      ),
    );
    expect(harness.lastSaved()?.completed).toBe(false);
  });

  it("keeps the input open when the AI closes the chat mid-question", async () => {
    const { api } = aiApi([
      {
        content: "<p>Well done. But what are the reaction products?</p>",
        completed: true,
        completionReason: "Criteria met",
      },
    ]);
    const harness = renderAssessment(AssessmentComponent, { settings, api });

    say("Light drives the reaction.");

    await waitFor(() =>
      expect(harness.getByText(/reaction products/)).toBeTruthy(),
    );

    expect(harness.lastSaved()?.completed).toBe(false);
    expect(document.querySelector("textarea")).toBeTruthy();
    expect(harness.queryByText("completed")).toBeNull();
  });

  it("ends the conversation on a closing message without a question", async () => {
    const { api } = aiApi([
      {
        content: "<p>That covers it, thanks for explaining.</p>",
        completed: true,
        completionReason: "Criteria met",
      },
    ]);
    const harness = renderAssessment(AssessmentComponent, { settings, api });

    say("Sunlight splits water and powers the reaction.");

    await waitFor(() => expect(harness.getByText("completed")).toBeTruthy());
    expect(document.querySelector("textarea")).toBeNull();
    expect(harness.lastSaved()?.completed).toBe(true);
  });

  it("warns the AI on its last turn and closes the chat afterwards", async () => {
    // maxTurns 3, and the answer already holds two AI messages
    const answer = {
      value: "",
      context: {
        chat: [
          { role: "system", content: "system prompt" },
          { role: "assistant", content: "<p>One?</p>" },
          { role: "user", content: "First answer" },
          { role: "assistant", content: "<p>Two?</p>" },
        ],
      },
    };
    const { api, generate } = aiApi([
      { content: "<p>And what about the products?</p>", completed: false },
    ]);
    const harness = renderAssessment(AssessmentComponent, {
      settings,
      answer,
      api,
    });

    say("Second answer");

    await waitFor(() => expect(generate).toHaveBeenCalled());

    const messages = messagesOf(generate);
    expect(messages.at(-1).content).toContain("last message");
    expect(messages.at(-1).hidden).toBe(true);

    // The turn budget is spent, so the conversation closes either way
    await waitFor(() => expect(harness.getByText("completed")).toBeTruthy());
    expect(harness.lastSaved()?.completed).toBe(true);
    expect(harness.lastSaved()?.context.chat.at(-1).completionReason).toBe(
      "maxTurns",
    );
  });

  it("opens the conversation itself when the AI starts", async () => {
    const { api, generate } = aiApi([
      {
        content: "<p>Shall we start with photosynthesis?</p>",
        completed: false,
      },
    ]);
    const harness = renderAssessment(AssessmentComponent, {
      settings: { ...settings, aiStarts: true },
      api,
    });

    await waitFor(() =>
      expect(harness.getByText(/Shall we start/)).toBeTruthy(),
    );

    // The kick-off message is hidden from the student and from the transcript
    expect(messagesOf(generate)[1].content).toBe("(conversation started)");
    expect(harness.queryByText("(conversation started)")).toBeNull();
    expect(harness.lastSaved()?.value).toBe(
      "<div><b>assistant:</b> <p>Shall we start with photosynthesis?</p></div>",
    );
  });
});
