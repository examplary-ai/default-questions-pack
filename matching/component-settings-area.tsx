import { TrashIcon } from "lucide-react";

import {
  FrontendQuestionSettingsAreaComponent,
  RichTextField,
} from "@examplary/ui";

export type Item = { left: string; right: string };

const SettingsAreaComponent: FrontendQuestionSettingsAreaComponent = ({
  settings,
  setMultipleSettings,
  t,
}) => {
  const options: Item[] = [
    ...(settings.pairs || []).map((item: string) => {
      const [left, right] = item.split(" = ", 2);
      return { left, right };
    }),
    { left: "", right: "" },
  ];

  const setOptions = (options: Item[]) => {
    const filteredOptions = options
      .filter(({ left }) => left && left.trim() !== "")
      .map(({ left, right }) => `${left} = ${right}`);

    setMultipleSettings({
      pairs: filteredOptions,
      correctAnswer: filteredOptions,
    });
  };

  return (
    <>
      <label className="block font-semibold font-heading mb-2">
        {t("pairs")}
      </label>

      <div className="flex flex-col gap-3">
        {options.map((option, index) => (
          <ItemRow
            key={index}
            index={index}
            value={option}
            options={options}
            setOptions={setOptions}
            last={index === options.length - 1}
            t={t}
          />
        ))}
      </div>

      <div className="text-xs text-zinc-500 mt-3">
        {t(
          settings.layout === "horizontal" ? "help-horizontal" : "help-vertical"
        )}
      </div>
    </>
  );
};

const ItemRow = ({ index, value, options, setOptions, t, last }) => {
  return (
    <div className="flex items-center" data-type="matching-option">
      <ItemInput
        data-type="matching-option-left"
        last={last}
        value={value.left}
        placeholder={t("placeholder-item")}
        onChange={(val: string) => {
          const next = [...options];
          next[index].left = val.replace(" = ", " - ");
          setOptions(next);
        }}
      />
      <div className="h-0.25 w-5 bg-border" />
      <ItemInput
        data-type="matching-option-right"
        last={last}
        value={value.right}
        placeholder={t("placeholder-answer")}
        onChange={(val: string) => {
          const next = [...options];
          next[index].right = val.replace(" = ", " - ");
          setOptions(next);
        }}
      />
      {!last ? (
        <button
          className="p-2 ml-3 text-zinc-400 hover:text-red-600"
          onClick={() => {
            const next = options.filter((_, i) => i !== index);
            setOptions(next);
          }}
        >
          <TrashIcon className="size-3.5" />
        </button>
      ) : (
        <div className="w-7.5 ml-3" />
      )}
    </div>
  );
};

const ItemInput = (props) => (
  <div className="flex-1">
    <RichTextField
      singleLine
      {...props}
      value={props.value || ""}
      className="rounded-3xl! px-4"
      onKeyUp={(e) => {
        // Move over to next input when Enter is pressed
        if (e.key === "Enter" && !e.shiftKey) {
          const s = '[data-type="matching-option"] [contenteditable]';
          const opt = (e.target as HTMLElement).closest(
            '[data-type="matching-option"]'
          );
          const nextInput = opt?.nextElementSibling?.querySelector(s);
          if (nextInput) {
            e.preventDefault();
            (nextInput as HTMLElement).focus();
            return false;
          }
          return;
        }
      }}
    />
  </div>
);

export default SettingsAreaComponent;
