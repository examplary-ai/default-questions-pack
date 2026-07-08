import { describe, expect, it } from "vitest";

import {
  findLabel,
  getMatchingData,
  joinPair,
  orderOptions,
  pairPrefix,
  shuffleUnaligned,
  splitPair,
} from "./shared";

describe("splitPair", () => {
  it("splits at the first ` = `", () => {
    expect(splitPair("Apple = Red")).toEqual({ left: "Apple", right: "Red" });
    expect(splitPair("a = b = c")).toEqual({ left: "a", right: "b = c" });
  });

  it("prefers an exact match against known left items", () => {
    expect(splitPair("a = b = c", ["a = b"])).toEqual({
      left: "a = b",
      right: "c",
    });
  });

  it("returns an empty right side when there is no separator", () => {
    expect(splitPair("Apple")).toEqual({ left: "Apple", right: "" });
  });
});

describe("joinPair / pairPrefix", () => {
  it("round-trips with splitPair", () => {
    expect(joinPair("Apple", "Red")).toBe("Apple = Red");
    expect(joinPair("Apple", "Red").startsWith(pairPrefix("Apple"))).toBe(true);
  });
});

describe("getMatchingData", () => {
  it("passes through the current settings format", () => {
    const data = getMatchingData({
      left: ["Apple", "Banana"],
      right: ["Red", "Yellow"],
      correctAnswer: ["Apple = Red", "Banana = Yellow"],
    });
    expect(data.left).toEqual([
      { value: "Apple", label: "Apple" },
      { value: "Banana", label: "Banana" },
    ]);
    expect(data.right.map((option) => option.value)).toEqual([
      "Red",
      "Yellow",
    ]);
    expect(data.correctAnswer).toEqual(["Apple = Red", "Banana = Yellow"]);
  });

  it("derives columns from the legacy pairs setting", () => {
    const data = getMatchingData({ pairs: ["Apple = Red", "Banana = Yellow"] });
    expect(data.left.map((option) => option.label)).toEqual([
      "Apple",
      "Banana",
    ]);
    expect(data.right.map((option) => option.label)).toEqual([
      "Red",
      "Yellow",
    ]);
    expect(data.correctAnswer).toEqual(["Apple = Red", "Banana = Yellow"]);
  });

  it("unescapes legacy `\\=` in labels but keeps values intact", () => {
    const data = getMatchingData({ pairs: ["x \\= 2 / 4 = x \\= 0.5"] });
    expect(data.left[0]).toEqual({ value: "x \\= 2 / 4", label: "x = 2 / 4" });
    expect(data.right[0]).toEqual({ value: "x \\= 0.5", label: "x = 0.5" });
    expect(data.correctAnswer).toEqual(["x \\= 2 / 4 = x \\= 0.5"]);
  });

  it("derives columns from correctAnswer when left/right are missing", () => {
    const data = getMatchingData({ correctAnswer: ["Apple = Red"] });
    expect(data.left.map((option) => option.value)).toEqual(["Apple"]);
    expect(data.right.map((option) => option.value)).toEqual(["Red"]);
  });

  it("handles missing settings", () => {
    expect(getMatchingData()).toEqual({
      left: [],
      right: [],
      correctAnswer: [],
    });
  });
});

describe("findLabel", () => {
  const options = [{ value: "x \\= 0.5", label: "x = 0.5" }];

  it("returns the label of the matching option", () => {
    expect(findLabel(options, "x \\= 0.5")).toBe("x = 0.5");
  });

  it("falls back to unescaping unknown values", () => {
    expect(findLabel(options, "y \\= 1")).toBe("y = 1");
  });
});

describe("shuffleUnaligned", () => {
  it("keeps all items but never returns the original order", () => {
    const items = ["Red", "Yellow", "Purple"];
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleUnaligned(items);
      expect(shuffled.toSorted()).toEqual(items.toSorted());
      expect(shuffled).not.toEqual(items);
    }
  });

  it("returns a single item as is", () => {
    expect(shuffleUnaligned(["Red"])).toEqual(["Red"]);
  });
});

describe("orderOptions", () => {
  const options = [
    { label: "<p>banana</p>" },
    { label: "Cherry" },
    { label: "apple" },
  ];

  it("sorts alphabetically when shuffle is off, ignoring markup and case", () => {
    expect(orderOptions(options, false).map((option) => option.label)).toEqual(
      ["apple", "<p>banana</p>", "Cherry"],
    );
  });

  it("keeps all options when shuffling", () => {
    const shuffled = orderOptions(options, true);
    expect(shuffled).toHaveLength(options.length);
    expect(new Set(shuffled)).toEqual(new Set(options));
  });

  it("does not mutate the input array", () => {
    const input = [...options];
    orderOptions(input, false);
    expect(input).toEqual(options);
  });
});
