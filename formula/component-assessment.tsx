import { useEffect, useRef } from "react";
import { FrontendAssessmentComponent } from "@examplary/ui";
import type { MathfieldElement } from "mathlive";
import "mathlive";

const AssessmentComponent: FrontendAssessmentComponent = ({
  answer,
  saveAnswer,
  t,
}) => {
  const ref = useRef<MathfieldElement>(null);
  const saveAnswerRef = useRef(saveAnswer);
  saveAnswerRef.current = saveAnswer;

  useEffect(() => {
    const mf = ref.current;
    if (!mf) return;

    if (answer?.value) {
      mf.value = answer.value as string;
    }

    const handleInput = () => {
      const value = mf.value;
      saveAnswerRef.current({ value, completed: value.trim().length > 0 });
    };

    mf.addEventListener("input", handleInput);
    return () => mf.removeEventListener("input", handleInput);
  }, []);

  return (
    // @ts-expect-error math-field
    <math-field
      ref={ref}
      class="border border-border w-full p-2 text-lg"
      style={{ borderRadius: "var(--radius-lg)" }}
    />
  );
};

export default AssessmentComponent;
