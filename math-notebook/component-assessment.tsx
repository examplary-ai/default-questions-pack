import { useEffect, useRef, useState, useCallback } from "react";
import { FrontendAssessmentComponent } from "@examplary/ui";
import { PlusIcon } from "lucide-react";
import type { MathfieldElement } from "mathlive";
import "mathlive";

const DEFAULT_LINE_COUNT = 6;

const MathLine = ({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
}) => {
  const ref = useRef<MathfieldElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const mf = ref.current;
    if (!mf) return;

    const handleInput = () => onChangeRef.current(mf.value);
    mf.addEventListener("input", handleInput);

    if (autoFocus) mf.focus();

    return () => mf.removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const mf = ref.current;
    if (mf && value !== mf.value) {
      mf.value = value;
    }
  }, [value]);

  return (
    // @ts-expect-error math-field
    <math-field
      ref={ref}
      class="w-full bg-transparent outline-none text-lg border-0 p-0 pl-4 py-1.5"
      style={{ minHeight: "2rem" }}
    />
  );
};

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  t,
}) => {
  const saveAnswerRef = useRef(saveAnswer);
  saveAnswerRef.current = saveAnswer;

  const initialLines =
    (question.settings?.initialLines as number) || DEFAULT_LINE_COUNT;
  const prefix = (question.settings?.prefix as string) || "";

  const parseValue = useCallback(
    (val: unknown): { lines: string[]; answer: string } => {
      if (Array.isArray(val) && val.length > 0) {
        return { lines: val.slice(0, -1), answer: val[val.length - 1] || "" };
      }
      return { lines: Array(initialLines).fill(""), answer: "" };
    },
    [initialLines],
  );

  const [lines, setLines] = useState<string[]>(
    () => parseValue(answer?.value).lines,
  );
  const [finalAnswer, setFinalAnswer] = useState<string>(
    () => parseValue(answer?.value).answer,
  );

  // Sync state when the answer prop changes externally
  useEffect(() => {
    const parsed = parseValue(answer?.value);
    setLines(parsed.lines);
    setFinalAnswer(parsed.answer);
  }, [answer?.value]);

  const persist = useCallback((workLines: string[], ans: string) => {
    const value = [...workLines, ans];
    const completed = ans.trim().length > 0;
    saveAnswerRef.current({ value, completed });
  }, []);

  const handleLineChange = useCallback(
    (index: number, val: string) => {
      setLines((prev) => {
        const next = [...prev];
        next[index] = val;
        persist(next, finalAnswer);
        return next;
      });
    },
    [finalAnswer, persist],
  );

  const handleAnswerChange = useCallback(
    (val: string) => {
      setFinalAnswer(val);
      persist(lines, val);
    },
    [lines, persist],
  );

  const addLines = useCallback(() => {
    setLines((prev) => {
      const next = [...prev, "", "", ""];
      persist(next, finalAnswer);
      return next;
    });
  }, [finalAnswer, persist]);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <style>{`math-field { --primary: var(--color-bright); }`}</style>

      {/* Header */}
      <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
        <span className="font-semibold text-sm">{t("calculation")}</span>
      </div>

      {/* Notebook lines */}
      <div className="divide-y divide-border">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center min-h-[2.5rem]">
            <div className="w-full">
              <MathLine
                value={line}
                onChange={(val) => handleLineChange(i, val)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add more lines */}
      <button
        type="button"
        onClick={addLines}
        className="w-full py-1.5 px-4 text-sm text-zinc-500 hover:text-black inline-flex items-center gap-1 transition-colors border-t border-border"
      >
        <PlusIcon className="size-3.5" />
        {t("addMoreLines")}
      </button>

      {/* Answer row */}
      <div className="flex items-center gap-2 pl-4 border-t-2 border-border">
        <span className="font-semibold text-sm shrink-0">{t("answer")}</span>
        {prefix && <span className="text-sm shrink-0">{prefix}</span>}
        <div className="flex-1">
          <MathLine value={finalAnswer} onChange={handleAnswerChange} />
        </div>
      </div>
    </div>
  );
};

export default AssessmentComponent;
