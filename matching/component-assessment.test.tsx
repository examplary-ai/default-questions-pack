import { describe, expect, it, vi } from "vitest";

import { dragOnto } from "../.tests/dnd";
import { renderAssessment } from "../.tests/render-assessment";

// vi.mock is hoisted above the imports, so the factory has to pull the
// helper in itself
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const { dndCoreMock } = await import("../.tests/dnd");
  return dndCoreMock(importOriginal as any);
});

const AssessmentComponent = (await import("./component-assessment")).default;

// Right-hand options are identified by their index in `settings.right`, which
// is how the component keeps duplicate values apart
const option = (indexInSettings: number) => `option-${indexInSettings}`;

const rows = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[data-type="matching-option"]'),
  );

/** The label placed in each slot, in row order; `null` for an empty slot */
const placed = () =>
  rows().map((row) => row.querySelector<HTMLElement>('[data-type="matching-right-slot"]')?.textContent ?? "");

const stems = () => rows().map((row) => row.children[0].textContent);

/** Labels of the options still sitting in the tray */
const available = () =>
  Array.from(document.querySelectorAll("button"))
    .filter((button) => !button.closest('[data-type="matching-option"]'))
    .map((button) => button.textContent);

describe("duplicate right-hand values", () => {
  const settings = {
    left: ["Apple", "Banana", "Grapes"],
    right: ["Red", "Red", "Yellow"],
    correctAnswer: ["Apple = Red", "Banana = Red", "Grapes = Yellow"],
    shuffle: false,
  };

  it("offers each duplicate as its own draggable option", () => {
    renderAssessment(AssessmentComponent, { settings });
    expect(stems()).toEqual(["Apple", "Banana", "Grapes"]);
    expect(available()).toEqual(["Red", "Red", "Yellow"]);
  });

  it("keeps the second copy available after placing the first", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });

    dragOnto(option(0), 0);

    expect(placed()).toEqual(["Red", "", ""]);
    expect(available()).toEqual(["Red", "Yellow"]);
    expect(harness.lastSaved()).toEqual({
      value: ["Apple = Red"],
      completed: false,
    });
  });

  it("fills both slots when an answer uses the same value twice", () => {
    renderAssessment(AssessmentComponent, {
      settings,
      answer: { value: ["Apple = Red", "Banana = Red"] },
    });

    expect(placed()).toEqual(["Red", "Red", ""]);
    expect(available()).toEqual(["Yellow"]);
  });

  it("completes once every slot is filled", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });

    dragOnto(option(0), 0);
    dragOnto(option(1), 1);
    dragOnto(option(2), 2);

    expect(placed()).toEqual(["Red", "Red", "Yellow"]);
    expect(harness.lastSaved()).toEqual({
      value: ["Apple = Red", "Banana = Red", "Grapes = Yellow"],
      completed: true,
    });
  });
});

describe("duplicate left-hand stems", () => {
  const settings = {
    left: ["Apple", "Apple", "Banana"],
    right: ["Red", "Green", "Yellow"],
    correctAnswer: ["Apple = Red", "Apple = Green", "Banana = Yellow"],
    shuffle: false,
  };

  it("shows both stems", () => {
    renderAssessment(AssessmentComponent, { settings });
    expect(stems()).toEqual(["Apple", "Apple", "Banana"]);
    expect(available()).toEqual(["Green", "Red", "Yellow"]);
  });

  it("keeps placements on separate stems when both are filled", () => {
    const harness = renderAssessment(AssessmentComponent, { settings });

    dragOnto(option(0), 0); // Red onto the first Apple
    dragOnto(option(1), 1); // Green onto the second Apple

    expect(placed()).toEqual(["Red", "Green", ""]);
    expect(harness.lastSaved()?.value).toEqual([
      "Apple = Red",
      "Apple = Green",
    ]);
  });

  it("restores an answer that fills both duplicate stems", () => {
    renderAssessment(AssessmentComponent, {
      settings,
      answer: { value: ["Apple = Red", "Apple = Green"] },
    });

    expect(placed()).toEqual(["Red", "Green", ""]);
    expect(available()).toEqual(["Yellow"]);
  });
});
