import { RichTextDisplay } from "@examplary/ui";
import { RadioGroup, RadioGroupItem } from "@examplary/ui";

export default ({ question, saveAnswer, answer }) => {
  const options = question.settings.shuffleAnswers
    ? [...(question.settings.options || [])].sort(() => Math.random() - 0.5)
    : question.settings.options || [];

  return (
    <RadioGroup
      value={(answer?.value as string) || ""}
      onValueChange={(value) => saveAnswer({ value, completed: true })}
    >
      <div className="flex flex-col items-start gap-3 pt-3">
        {options.map((option, index) => (
          <label key={index} className="flex gap-2 items-start w-full">
            <RadioGroupItem value={option} />
            <RichTextDisplay className="text-sm">{option}</RichTextDisplay>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};
