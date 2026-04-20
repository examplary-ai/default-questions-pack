import { FrontendResultsComponent } from "@examplary/ui";
import "mathlive";

const ResultsComponent: FrontendResultsComponent = ({ question, answer, t }) => {
  if (!answer.value) return null;

  const prefix = (question.settings?.prefix as string) || "";
  const values: string[] = Array.isArray(answer.value) ? answer.value : [];

  if (values.length === 0) return null;

  const workLines = values.slice(0, -1).filter((l) => l?.trim().length > 0);
  const finalAnswer = values[values.length - 1] || "";

  return (
    <div className="space-y-1">
      {workLines.length > 0 && (
        <div className="space-y-0.5 text-muted-foreground text-sm">
          {workLines.map((line, i) => (
            // @ts-expect-error math-span
            <div key={i}><math-span>{line}</math-span></div>
          ))}
        </div>
      )}
      <div className="inline-flex items-center gap-2 pt-1 border-t-2 border-border">
        {/* @ts-expect-error math-span */}
        <math-span>{finalAnswer}</math-span>
      </div>
    </div>
  );
};

export default ResultsComponent;
