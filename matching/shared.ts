import striptags from "striptags";

export type Item = { left: string; right: string };

export type MatchingOption = {
  // The exact string stored in answer values and `correctAnswer` pairs
  value: string;
  // The text shown to the user; differs from `value` only for legacy
  // `pairs` questions, where a literal `=` was escaped as `\=`
  label: string;
};

export type MatchingData = {
  left: MatchingOption[];
  right: MatchingOption[];
  correctAnswer: string[];
};

const PAIR_SEPARATOR = " = ";

const unescapeLegacy = (text: string) => text.replace(/\\=/g, "=");

export const joinPair = (left: string, right: string) =>
  `${left}${PAIR_SEPARATOR}${right}`;

export const pairPrefix = (left: string) => `${left}${PAIR_SEPARATOR}`;

// Splits a pair string at the first ` = `. When the left-hand items are
// known, prefer an exact prefix match so items containing ` = ` survive.
export const splitPair = (pair: string, leftValues?: string[]): Item => {
  const matchedLeft = leftValues?.find((value) =>
    pair.startsWith(pairPrefix(value)),
  );
  if (matchedLeft !== undefined) {
    return {
      left: matchedLeft,
      right: pair.slice(pairPrefix(matchedLeft).length),
    };
  }
  const index = pair.indexOf(PAIR_SEPARATOR);
  if (index === -1) return { left: pair, right: "" };
  return {
    left: pair.slice(0, index),
    right: pair.slice(index + PAIR_SEPARATOR.length),
  };
};

// Normalizes question settings to the current format. Questions created
// before the `left`/`right`/`correctAnswer` settings existed only have a
// `pairs` array of `left = right` strings with literal `=` escaped as `\=`.
export const getMatchingData = (
  settings: {
    left?: string[];
    right?: string[];
    correctAnswer?: string[];
    pairs?: string[];
  } = {},
): MatchingData => {
  if (settings.left || settings.right) {
    const toOption = (value: string): MatchingOption => ({
      value,
      label: value,
    });
    return {
      left: (settings.left || []).map(toOption),
      right: (settings.right || []).map(toOption),
      correctAnswer: settings.correctAnswer || [],
    };
  }

  const pairs = (settings.pairs || settings.correctAnswer || []).map((pair) =>
    splitPair(pair),
  );
  return {
    left: pairs.map(({ left }) => ({
      value: left,
      label: unescapeLegacy(left),
    })),
    right: pairs.map(({ right }) => ({
      value: right,
      label: unescapeLegacy(right),
    })),
    correctAnswer: pairs.map(({ left, right }) => joinPair(left, right)),
  };
};

// Resolves the right-hand value shown in each left-hand slot. Left items may
// repeat, so pairs are consumed as they are assigned: the Nth slot with a
// given left value takes the Nth pair for that value, rather than every
// duplicate slot resolving to the same first pair.
export const assignPairsToSlots = (
  leftItems: { value: string }[],
  pairs: string[],
): (string | undefined)[] => {
  const leftValues = leftItems.map(({ value }) => value);
  const resolved = pairs.map((pair) => splitPair(pair, leftValues));
  const used = new Set<number>();

  return leftItems.map(({ value }) => {
    const index = resolved.findIndex(
      (item, i) => !used.has(i) && item.left === value,
    );
    if (index === -1) return undefined;
    used.add(index);
    return resolved[index].right;
  });
};

export const findLabel = (options: MatchingOption[], value: string) =>
  options.find((option) => option.value === value)?.label ??
  unescapeLegacy(value);

// Stores the right column in a shuffled order, so printed sheets (which
// show the arrays in settings order) do not give away the answers by
// having the matches line up
export const shuffleUnaligned = (items: string[]): string[] => {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  if (items.length > 1 && shuffled.every((item, i) => item === items[i])) {
    shuffled.push(shuffled.shift()!);
  }
  return shuffled;
};

// With shuffle enabled the options are shown in a random order; without
// it they are shown alphabetically.
export const orderOptions = <T extends { label: string }>(
  options: T[],
  shuffle: boolean | undefined,
): T[] =>
  shuffle
    ? [...options].sort(() => 0.5 - Math.random())
    : [...options].sort((a, b) =>
        striptags(a.label).localeCompare(striptags(b.label), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
