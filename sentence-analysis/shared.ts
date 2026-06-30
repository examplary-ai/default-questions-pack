export type ZinsdeelCode =
  | "OW"
  | "WG"
  | "NG"
  | "LV"
  | "MV"
  | "VV"
  | "BWB"
  | "BVB"
  | "DB"
  | "VW";

export type Token = {
  index: number;
  text: string;
  start: number;
  end: number;
};

export type TokenRange = {
  startToken: number;
  endToken: number;
};

export type Segment = TokenRange & {
  label: ZinsdeelCode | null;
};

export type SentenceParse = {
  raw: string;
  tokens: Token[];
  segments: Segment[];
  persoonsvorm: TokenRange | null;
};

export type SentenceAnalysisAnswerValue = string[];

export const LABELS: {
  code: ZinsdeelCode;
  en: string;
  nl: string;
  color?: string;
}[] = [
  { code: "OW", en: "Subject", nl: "Onderwerp", color: 'bg-blue-100 text-blue-800' },
  { code: "WG", en: "Verbal predicate", nl: "Werkwoordelijk gezegde", color: 'bg-green-100 text-green-800' },
  { code: "NG", en: "Nominal predicate", nl: "Naamwoordelijk gezegde", color: 'bg-yellow-100 text-yellow-800' },
  { code: "LV", en: "Direct object", nl: "Lijdend voorwerp", color: 'bg-red-100 text-red-800' },
  { code: "MV", en: "Indirect object", nl: "Meewerkend voorwerp", color: 'bg-purple-100 text-purple-800' },
  { code: "VV", en: "Prepositional object", nl: "Voorzetselvoorwerp", color: 'bg-pink-100 text-pink-800' },
  { code: "BWB", en: "Adverbial adjunct", nl: "Bijwoordelijke bepaling", color: 'bg-teal-100 text-teal-800' },
  { code: "BVB", en: "Attributive modifier", nl: "Bijvoeglijke bepaling", color: 'bg-indigo-100 text-indigo-800' },
  { code: "DB", en: "Predicative adjunct", nl: "Dubbelverbonden bepaling", color: 'bg-gray-100 text-gray-800' },
  { code: "VW", en: "Conjunction", nl: "Voegwoord", color: 'bg-orange-100 text-orange-800' },
];

export const DEFAULT_LABELS: ZinsdeelCode[] = ["OW", "WG", "LV", "BWB"];

export const tokenize = (raw: string): Token[] => {
  const tokens: Token[] = [];
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(raw))) {
    tokens.push({
      index: tokens.length,
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
};

export const createSingleSegmentParse = (raw: string): SentenceParse => {
  const tokens = tokenize(raw);
  return {
    raw,
    tokens,
    segments: tokens.length
      ? [
          {
            startToken: 0,
            endToken: tokens.length - 1,
            label: null,
          },
        ]
      : [],
    persoonsvorm: null,
  };
};

export const normalizeParse = (
  raw: string,
  parse?: Partial<SentenceParse> | null,
): SentenceParse => {
  const tokens = tokenize(raw);

  if (!tokens.length) {
    return { raw, tokens, segments: [], persoonsvorm: null };
  }

  const fallback = createSingleSegmentParse(raw);
  const incomingSegments = Array.isArray(parse?.segments)
    ? parse?.segments
    : fallback.segments;

  const segments: Segment[] = [];
  let expectedStart = 0;

  for (const segment of incomingSegments || []) {
    const startToken = Number(segment.startToken);
    const endToken = Number(segment.endToken);

    if (
      !Number.isInteger(startToken) ||
      !Number.isInteger(endToken) ||
      startToken !== expectedStart ||
      endToken < startToken ||
      endToken >= tokens.length
    ) {
      return fallback;
    }

    segments.push({
      startToken,
      endToken,
      label: (segment.label as ZinsdeelCode | null) || null,
    });
    expectedStart = endToken + 1;
  }

  if (expectedStart !== tokens.length) return fallback;

  const pv = parse?.persoonsvorm;
  const persoonsvorm =
    pv &&
    Number.isInteger(pv.startToken) &&
    Number.isInteger(pv.endToken) &&
    pv.startToken >= 0 &&
    pv.endToken >= pv.startToken &&
    pv.endToken < tokens.length
      ? { startToken: pv.startToken, endToken: pv.endToken }
      : null;

  return {
    raw,
    tokens,
    segments,
    persoonsvorm,
  };
};

export const segmentText = (parse: SentenceParse, segment: Segment) =>
  parse.tokens
    .slice(segment.startToken, segment.endToken + 1)
    .map((token) => token.text)
    .join(" ");

export const splitSegment = (parse: SentenceParse, tokenIndex: number) => {
  const segments: Segment[] = [];

  for (const segment of parse.segments) {
    if (
      tokenIndex >= segment.startToken &&
      tokenIndex < segment.endToken
    ) {
      segments.push({
        startToken: segment.startToken,
        endToken: tokenIndex,
        label: segment.label,
      });
      segments.push({
        startToken: tokenIndex + 1,
        endToken: segment.endToken,
        label: segment.label,
      });
    } else {
      segments.push(segment);
    }
  }

  return { ...parse, segments };
};

export const mergeAcrossBoundary = (
  parse: SentenceParse,
  tokenIndex: number,
) => {
  const next: Segment[] = [];

  for (let i = 0; i < parse.segments.length; i++) {
    const segment = parse.segments[i];
    const following = parse.segments[i + 1];

    if (segment.endToken === tokenIndex && following) {
      next.push({
        startToken: segment.startToken,
        endToken: following.endToken,
        label: segment.label || following.label,
      });
      i++;
    } else {
      next.push(segment);
    }
  }

  return { ...parse, segments: next };
};

export const toggleBoundary = (parse: SentenceParse, tokenIndex: number) => {
  const segment = parse.segments.find(
    (item) => tokenIndex >= item.startToken && tokenIndex < item.endToken,
  );

  return segment
    ? splitSegment(parse, tokenIndex)
    : mergeAcrossBoundary(parse, tokenIndex);
};

export const setSegmentLabel = (
  parse: SentenceParse,
  segmentIndex: number,
  label: ZinsdeelCode | null,
) => ({
  ...parse,
  segments: parse.segments.map((segment, index) =>
    index === segmentIndex ? { ...segment, label } : segment,
  ),
});

export const togglePersoonsvorm = (
  parse: SentenceParse,
  tokenIndex: number,
) => {
  const current = parse.persoonsvorm;
  const persoonsvorm =
    current?.startToken === tokenIndex && current?.endToken === tokenIndex
      ? null
      : { startToken: tokenIndex, endToken: tokenIndex };

  return { ...parse, persoonsvorm };
};

export const isComplete = (parse: SentenceParse, requirePersoonsvorm = true) =>
  parse.segments.length > 0 &&
  parse.segments.every((segment) => Boolean(segment.label)) &&
  (!requirePersoonsvorm || Boolean(parse.persoonsvorm));

export const sameRange = (
  left?: TokenRange | null,
  right?: TokenRange | null,
) =>
  (!left && !right) ||
  (Boolean(left) &&
    Boolean(right) &&
    left?.startToken === right?.startToken &&
    left?.endToken === right?.endToken);

export const parseToAnswerValue = (
  parse: SentenceParse,
  requirePersoonsvorm = true,
): SentenceAnalysisAnswerValue => {
  const value = parse.segments.map(
    (segment) =>
      `${segment.startToken}-${segment.endToken}:${segment.label || ""}`,
  );

  if (requirePersoonsvorm && parse.persoonsvorm) {
    value.push(
      `PV:${parse.persoonsvorm.startToken}-${parse.persoonsvorm.endToken}`,
    );
  }

  return value;
};

export const answerValueToParse = (
  raw: string,
  value?: unknown,
): SentenceParse => {
  if (!Array.isArray(value)) {
    return normalizeParse(raw, value as Partial<SentenceParse> | null);
  }

  const segments: Segment[] = [];
  let persoonsvorm: TokenRange | null = null;

  for (const item of value) {
    if (typeof item !== "string") continue;

    const pvMatch = item.match(/^PV:(\d+)-(\d+)$/);
    if (pvMatch) {
      persoonsvorm = {
        startToken: Number(pvMatch[1]),
        endToken: Number(pvMatch[2]),
      };
      continue;
    }

    const segmentMatch = item.match(/^(\d+)-(\d+):([A-Z]*)$/);
    if (!segmentMatch) continue;

    segments.push({
      startToken: Number(segmentMatch[1]),
      endToken: Number(segmentMatch[2]),
      label: (segmentMatch[3] as ZinsdeelCode) || null,
    });
  }

  return normalizeParse(raw, {
    raw,
    segments,
    persoonsvorm,
  });
};
