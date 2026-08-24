import { describe, expect, it } from "vitest";

import {
  containsQuestion,
  isFinalTurn,
  resolveTurn,
  stripHtml,
  transcriptValue,
} from "./shared";
import { getPersona, localized, personas } from "./personas";

describe("containsQuestion", () => {
  it("sees through HTML markup", () => {
    expect(containsQuestion("<p>Can you explain that?</p>")).toBe(true);
    expect(containsQuestion("<p>Nicely explained.</p>")).toBe(false);
  });

  it("handles inverted question marks", () => {
    expect(containsQuestion("¿Qué quieres beber?")).toBe(true);
  });
});

describe("resolveTurn", () => {
  const turn = (overrides: any = {}) => ({
    content: "<p>Thanks, that was clear.</p>",
    completed: false,
    ...overrides,
  });

  it("leaves an ordinary turn alone", () => {
    const resolved = resolveTurn(turn({ content: "<p>Why is that?</p>" }), {
      priorAssistantTurns: 2,
      maxTurns: 10,
    });

    expect(resolved.completed).toBe(false);
  });

  it("keeps the conversation open when the closing message still asks something", () => {
    const resolved = resolveTurn(
      turn({ completed: true, content: "<p>Good. And why does that work?</p>" }),
      { priorAssistantTurns: 2, maxTurns: 10 },
    );

    expect(resolved.completed).toBe(false);
  });

  it("accepts a closing message without a question", () => {
    const resolved = resolveTurn(turn({ completed: true }), {
      priorAssistantTurns: 2,
      maxTurns: 10,
    });

    expect(resolved.completed).toBe(true);
  });

  it("closes the conversation once the message budget is used up", () => {
    const resolved = resolveTurn(
      turn({ content: "<p>And what happens next?</p>" }),
      { priorAssistantTurns: 4, maxTurns: 5 },
    );

    expect(resolved.completed).toBe(true);
    expect(resolved.completionReason).toBe("maxTurns");
  });

  it("keeps the model's own completion reason when it wrapped up in time", () => {
    const resolved = resolveTurn(
      turn({ completed: true, completionReason: "All criteria met." }),
      { priorAssistantTurns: 4, maxTurns: 5 },
    );

    expect(resolved.completionReason).toBe("All criteria met.");
  });
});

describe("isFinalTurn", () => {
  it("marks the message that fills the budget, not the one after it", () => {
    expect(isFinalTurn({ priorAssistantTurns: 3, maxTurns: 5 })).toBe(false);
    expect(isFinalTurn({ priorAssistantTurns: 4, maxTurns: 5 })).toBe(true);
  });
});

describe("transcriptValue", () => {
  it("labels each message and drops system and hidden messages", () => {
    const value = transcriptValue([
      { role: "system", content: "the system prompt" },
      { role: "user", content: "(conversation started)", hidden: true },
      { role: "assistant", content: "Bonjour !" },
      { role: "user", content: "Bonjour, un café." },
    ]);

    expect(value).toBe(
      "<div><b>assistant:</b> Bonjour !</div>\n" +
        "<div><b>student:</b> Bonjour, un café.</div>",
    );
  });
});

describe("stripHtml", () => {
  it("collapses markup and whitespace", () => {
    expect(stripHtml("<ul><li>one</li><li>two</li></ul>")).toBe("one two");
  });
});

describe("personas", () => {
  it("has a unique id, and both languages, for every persona", () => {
    const ids = personas.map((persona) => persona.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const persona of personas) {
      expect(persona.title.en.length).toBeGreaterThan(0);
      expect(persona.title.nl.length).toBeGreaterThan(0);
      expect(persona.systemPrompt.en.length).toBeGreaterThan(50);
      expect(persona.systemPrompt.nl.length).toBeGreaterThan(50);
    }
  });

  it("falls back to the default persona for an unknown id", () => {
    expect(getPersona("does-not-exist").id).toBe("knowledge-examiner");
    expect(getPersona(undefined).id).toBe("knowledge-examiner");
    expect(getPersona("debater").id).toBe("debater");
  });

  it("picks the Dutch variant for Dutch locales only", () => {
    const title = { en: "Debater", nl: "Debater NL" };
    expect(localized(title, "nl")).toBe("Debater NL");
    expect(localized(title, "nl-NL")).toBe("Debater NL");
    expect(localized(title, "en-GB")).toBe("Debater");
    expect(localized(title, undefined)).toBe("Debater");
  });
});
