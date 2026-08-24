import { describe, expect, it } from "vitest";

import {
  containsQuestion,
  instructionsAiMode,
  instructionsMessages,
  isFinalTurn,
  resolveTurn,
  stripHtml,
  transcriptValue,
} from "./shared";
import { getPersona, localized, personas } from "./personas";
import { systemPrompt } from "./system-prompt";

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

describe("systemPrompt", () => {
  const prompt = systemPrompt({
    title: "Acids and bases",
    description: "Explain what happens when an acid dissolves.",
    settings: { persona: "math-tutor", instructions: "Ask why", maxTurns: 6 },
  });

  it("teaches the renderer's own math syntax", () => {
    expect(prompt).toContain("<inline-math>2x + 3 = 7</inline-math>");
    expect(prompt).toContain("Never write $...$");
    expect(prompt).toContain("Markdown is NOT supported");
  });

  // The rules live in a template literal, so a single backslash in the source
  // silently becomes a tab or a form feed - which is the exact breakage the
  // rules warn about
  it("carries real backslashes, not control characters", () => {
    expect(prompt).toContain(String.raw`\text{}`);
    expect(prompt).toContain(String.raw`\(...\)`);
    expect(prompt).not.toMatch(/[\t\f]/);
  });

  it("passes the persona and the turn budget through", () => {
    expect(prompt).toContain("Math tutor");
    expect(prompt).toContain("at most 6 messages");
  });
});

describe("instructionsAiMode", () => {
  const question = { title: "Photosynthesis", description: "Discuss it." };

  it("offers to generate when there are no instructions yet", () => {
    expect(instructionsAiMode(question, {})).toBe("generate");
    expect(instructionsAiMode(question, { instructions: "<p></p>" })).toBe(
      "generate",
    );
  });

  it("offers to improve as soon as the teacher has written something", () => {
    expect(
      instructionsAiMode(question, { instructions: "<p>Ask why</p>" }),
    ).toBe("improve");
  });

  it("stays away when there is nothing at all to work from", () => {
    expect(instructionsAiMode({ title: "Photosynthesis" }, {})).toBeNull();
    expect(instructionsAiMode({}, {})).toBeNull();
  });
});

describe("instructionsMessages", () => {
  const question = { title: "Photosynthesis", description: "Discuss it." };

  it("passes the draft along when improving", () => {
    const [system, user] = instructionsMessages(
      question,
      { instructions: "<p>Ask about sunlight</p>", persona: "debater" },
      "improve",
    );

    expect(system.content).toContain("you complete their draft");
    expect(system.content).toContain("Debater");
    expect(JSON.parse(user.content).teacherDraft).toBe(
      "<p>Ask about sunlight</p>",
    );
  });

  it("works from the title and description when generating", () => {
    const [system, user] = instructionsMessages(question, {}, "generate");

    expect(system.content).toContain("There is no draft yet");
    expect(JSON.parse(user.content).teacherDraft).toBe("");
    expect(JSON.parse(user.content).questionTitle).toBe("Photosynthesis");
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

      // Math has to go through <inline-math>, never through dollar signs
      expect(persona.systemPrompt.en).not.toContain("$");
      expect(persona.systemPrompt.nl).not.toContain("$");
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
