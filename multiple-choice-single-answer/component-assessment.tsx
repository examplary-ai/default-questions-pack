import { RichTextDisplay } from "@examplary/ui";
import { RadioGroup, RadioGroupItem } from "@examplary/ui";

export default ({ question, saveAnswer, answer }) => {
    return (
      <RadioGroup
        value={(answer?.value as string) || ""}
        onValueChange={(value) => saveAnswer({ value, completed: true })}
      >
        <div className="flex flex-col items-start gap-3 pt-3">
          {(question.settings.options || []).map((option, index) => (
            <label key={index} className="flex gap-2 items-start w-full">
              <RadioGroupItem value={option.value} />
              <RichTextDisplay className="text-sm">
                {option.value}
              </RichTextDisplay>
            </label>
          ))}
        </div>
      </RadioGroup>
    );
  };
