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
