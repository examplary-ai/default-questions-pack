import { fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderAssessment } from "../.tests/render-assessment";
import AssessmentComponent from "./component-assessment";

const settings = {
  text: "The capital of France is ___ and the capital of Spain is ___.",
  correctAnswer: ["Paris", "Madrid"],
};

const blanks = () => Array.from(document.querySelectorAll("input"));

const type = (blank: HTMLInputElement, text: string) =>
  fireEvent.change(blank, { target: { value: text } });

describe("answer order", () => {
  it("renders one blank per ___", () => {
    renderAssessment(AssessmentComponent, { settings });
    expect(blanks()).toHaveLength(2);
  });

  it("saves each blank at its own position when filled left to right", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });
    const [france, spain] = blanks();

    type(france, "Paris");
    type(spain, "Madrid");

    expect(harness.lastSaved()?.value).toEqual(["Paris", "Madrid"]);
  });

  it("saves each blank at its own position when filled right to left", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });
    const [france, spain] = blanks();

    type(spain, "Madrid");
    type(france, "Paris");

    expect(harness.lastSaved()?.value).toEqual(["Paris", "Madrid"]);
  });

  // A skipped blank used to leave a hole in the array, which serialises to
  // null and makes the `$trim` in responseProcessing error out
  it("saves a filled-in string for a skipped blank", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });
    const [, spain] = blanks();

    type(spain, "Madrid");

    const value = harness.lastSaved()?.value as string[];
    expect(value).toEqual(["", "Madrid"]);
    expect(value.every((entry) => typeof entry === "string")).toBe(true);
    expect(JSON.stringify(value)).toBe('["","Madrid"]');
  });

  it("keeps a skipped blank in place once the earlier one is filled", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });
    const [france, spain] = blanks();

    type(spain, "Madrid");
    type(france, "Paris");

    expect(harness.lastSaved()?.value).toEqual(["Paris", "Madrid"]);
  });

  it("only reports completed once every blank is filled", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });
    const [france, spain] = blanks();

    type(france, "Paris");
    expect(harness.lastSaved()?.completed).toBe(false);

    type(spain, "Madrid");
    expect(harness.lastSaved()?.completed).toBe(true);
  });
});

// The text comes out of the rich text editor, so it is HTML rather than a
// plain string. It used to be split on `___` into separate fragments, which
// left each one unbalanced: the browser closed the paragraph early, pushing
// the first blank onto its own line, and added a stray empty one at the end.
describe("rich text", () => {
  const richSettings = {
    text: "<p>The capital of France is ___ and the capital of Spain is ___.</p>",
    correctAnswer: ["Paris", "Madrid"],
  };

  it("keeps the blanks inline in the paragraph they belong to", () => {
    renderAssessment(AssessmentComponent, { settings: richSettings });

    const paragraphs = document.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].querySelectorAll("input")).toHaveLength(2);
  });

  it("preserves the sentence around the blanks", () => {
    renderAssessment(AssessmentComponent, { settings: richSettings });

    expect(document.querySelector("p")?.textContent).toBe(
      "The capital of France is  and the capital of Spain is .",
    );
  });

  it("keeps markup inside the text", () => {
    renderAssessment(AssessmentComponent, {
      settings: {
        text: "<p>The capital of <strong>France</strong> is ___.</p>",
        correctAnswer: ["Paris"],
      },
    });

    expect(document.querySelector("strong")?.textContent).toBe("France");
    expect(document.querySelectorAll("input")).toHaveLength(1);
  });

  it("still saves the right blank when the text is rich", () => {
    const harness = renderAssessment(AssessmentComponent, {
      settings: richSettings,
    });
    const [france, spain] = blanks();

    type(spain, "Madrid");
    type(france, "Paris");

    expect(harness.lastSaved()?.value).toEqual(["Paris", "Madrid"]);
  });

  // The inputs are portalled into placeholders inside the rendered HTML, so a
  // re-render must not rebuild that HTML — it would swap the inputs out from
  // under the student mid-keystroke, losing focus and caret position
  it("reuses the same input elements across edits", () => {
    renderAssessment(AssessmentComponent, { settings: richSettings });
    const before = blanks();

    type(before[0], "Paris");

    const after = blanks();
    expect(after).toHaveLength(2);
    expect(after[0]).toBe(before[0]);
    expect(after[1]).toBe(before[1]);
    expect(after[0].isConnected).toBe(true);
  });
});

// Several questions are shown on one page in practice, so each instance has
// to find its own placeholders rather than every `[data-blank]` in the
// document — the indices repeat across questions
describe("multiple questions on one page", () => {
  const france = {
    text: "<p>The capital of France is ___.</p>",
    correctAnswer: ["Paris"],
  };
  const spain = {
    text: "<p>The capital of Spain is ___ and of Portugal is ___.</p>",
    correctAnswer: ["Madrid", "Lisbon"],
  };

  it("gives each question only its own blanks", () => {
    const first = renderAssessment(AssessmentComponent, { settings: france });
    const second = renderAssessment(AssessmentComponent, { settings: spain });

    expect(first.container.querySelectorAll("input")).toHaveLength(1);
    expect(second.container.querySelectorAll("input")).toHaveLength(2);
    expect(document.querySelectorAll("input")).toHaveLength(3);
  });

  it("saves to the question the blank belongs to", () => {
    const first = renderAssessment(AssessmentComponent, { settings: france });
    const second = renderAssessment(AssessmentComponent, { settings: spain });

    type(second.container.querySelectorAll("input")[1], "Lisbon");
    type(first.container.querySelectorAll("input")[0], "Paris");

    expect(first.lastSaved()?.value).toEqual(["Paris"]);
    expect(second.lastSaved()?.value).toEqual(["", "Lisbon"]);
  });

  it("leaves the other question's inputs untouched", () => {
    const first = renderAssessment(AssessmentComponent, { settings: france });
    const second = renderAssessment(AssessmentComponent, { settings: spain });
    const untouched = Array.from(second.container.querySelectorAll("input"));

    type(first.container.querySelectorAll("input")[0], "Paris");

    expect(Array.from(second.container.querySelectorAll("input"))).toEqual(
      untouched,
    );
    expect(second.saved).toHaveLength(0);
  });
});
