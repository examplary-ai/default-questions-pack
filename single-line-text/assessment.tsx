import { RichTextField } from "@examplary/ui";
// TODO: export this component
// TODO: update to use className -> editorClassName
// TODO: update to return empty string if isEmpty(value)

export default ({ answer, saveAnswer }) => {
  return (
    <RichTextField
      value={(answer?.value as string) || ""}
      onChange={(value) => {
        const valid = value.trim().length > 0;
        saveAnswer({ value, completed: valid });
      }}
      className="box p-3 text-sm"
    />
  );
};
