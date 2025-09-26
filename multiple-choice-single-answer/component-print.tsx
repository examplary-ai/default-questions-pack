import { RichTextDisplay } from "@examplary/ui";

export default ({ question }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {(question.settings.options || []).map((option, index) => (
        <div key={index} className="flex gap-2 items-center w-full">
          <div className="aspect-square size-5 rounded-full border border-black" />
          <RichTextDisplay className="flex-1">{option}</RichTextDisplay>
        </div>
      ))}
    </div>
  );
};
