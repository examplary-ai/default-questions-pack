import { useMemo } from "react";

import {
  FrontendAssessmentComponent,
  RichTextField,
  RichTextToolbar,
} from "@examplary/ui";
import stripTags from "striptags";
import count from "word-count";

const EssayQuestionComponent: FrontendAssessmentComponent = ({
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
        className="rounded-t-none! min-h-32"
        slotBefore={(editor) => <RichTextToolbar editor={editor} />}
      />
      {wordCount > 0 || min || max ? (
        <div className="text-gray-500 text-sm mt-2">
          {t("word-count", { count: wordCount })}{" "}
          {min > 0 && t("word-count-min", { min })}{" "}
          {max > 0 && t("word-count-max", { max })}
        </div>
      ) : null}
    </>
  );
};

export default EssayQuestionComponent;
