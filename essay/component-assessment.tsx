import { useMemo } from "react";

import {
  FrontendAssessmentComponent,
  RichTextField,
  RichTextToolbar,
} from "@examplary/ui";
import stripTags from "striptags";
import count from "word-count";

export const EssayQuestionComponent: FrontendAssessmentComponent = ({
  answer,
  question,
  saveAnswer,
  t,
}) => {
  const wordCount = useMemo(
    () => count(stripTags((answer?.value as string) || "")),
    [answer?.value]
  );

  const min = Number(question.settings["minWords"] || 0);
  const max = Number(question.settings["maxWords"] || 0);

  return (
    <>
      <RichTextField
        value={(answer?.value as string) || ""}
        onChange={(value) => {
          const valid = wordCount >= min && (max === 0 || wordCount <= max);
          saveAnswer({
            value,
            completed: valid,
          });
        }}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          minHeight: "8rem",
        }}
        slotBefore={(editor) => <RichTextToolbar editor={editor} />}
      />
      {wordCount > 0 || min || max ? (
        <div
          style={{
            marginTop: "0.5rem",
            color: "var(--color-gray-500)",
            fontSize: "0.875rem",
          }}
        >
          {t("question-type.essay.word-count", { count: wordCount })}{" "}
          {min > 0 && t("question-type.essay.word-count-min", { min })}{" "}
          {max > 0 && t("question-type.essay.word-count-max", { max })}
        </div>
      ) : null}
    </>
  );
};
