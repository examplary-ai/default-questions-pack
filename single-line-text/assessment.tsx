import { RichTextField } from "@examplary/ui";

export default ({ answer, saveAnswer }) => {
  return (
    <RichTextField
      singleLine
      value={(answer?.value as string) || ""}
      onChange={(value) => {
        const valid = value.trim().length > 0;
        saveAnswer({ value, completed: valid });
      }}
    />
  );
};
