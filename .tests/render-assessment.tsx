import type { FrontendAssessmentComponent } from "@examplary/ui";
import { render, type RenderResult } from "@testing-library/react";
import { useState } from "react";
import { vi } from "vitest";

type Answer = { value: string | string[]; completed?: boolean; context?: any };

type Options = {
  settings?: Record<string, any>;
  answer?: Answer;
  reviewMode?: boolean;
  isPreview?: boolean;
  /** Stands in for the host API, e.g. `{ ai: { generate } }` for AI question types */
  api?: any;
};

// Stands in for the exam host: assessment components are controlled, so a
// saved answer only shows up once it is handed back in via the `answer` prop
const Host = ({
  Component,
  settings,
  initialAnswer,
  onSave,
  reviewMode,
  isPreview,
  api,
}: any) => {
  const [answer, setAnswer] = useState<Answer | undefined>(initialAnswer);
  return (
    <Component
      question={{ id: "question-1", settings }}
      answer={answer}
      saveAnswer={async (saved: Answer) => {
        onSave(saved);
        setAnswer(saved);
      }}
      reviewMode={reviewMode}
      isPreview={isPreview}
      isLoading={false}
      environment="exam"
      // Translations are not bundled with the pack, so keys stand in for copy
      t={(key: string | string[]) => (Array.isArray(key) ? key[0] : key)}
      i18n={{ language: "en" }}
      api={api}
    />
  );
};

export type AssessmentHarness = RenderResult & {
  /** Every answer the component has saved, oldest first */
  saved: Answer[];
  /** The most recently saved answer */
  lastSaved: () => Answer | undefined;
};

export const renderAssessment = (
  Component: FrontendAssessmentComponent,
  {
    settings = {},
    answer,
    reviewMode = false,
    isPreview = false,
    api = {},
  }: Options = {},
): AssessmentHarness => {
  const saved: Answer[] = [];
  const onSave = vi.fn((a: Answer) => {
    saved.push(a);
  });

  const result = render(
    <Host
      Component={Component}
      settings={settings}
      initialAnswer={answer}
      onSave={onSave}
      reviewMode={reviewMode}
      isPreview={isPreview}
      api={api}
    />,
  );

  return {
    ...result,
    saved,
    lastSaved: () => saved.at(-1),
  };
};
