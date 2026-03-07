import { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ t, answerBoxes }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex gap-2 items-center w-full">
        {answerBoxes ? (
          <div className="aspect-square size-5 rounded-full border border-black" />
        ) : (
          <span>A.</span>
        )}
        <div className="flex-1">{t("true")}</div>
      </div>
      <div className="flex gap-2 items-center w-full">
        {answerBoxes ? (
          <div className="aspect-square size-5 rounded-full border border-black" />
        ) : (
          <span>B.</span>
        )}
        <div className="flex-1">{t("false")}</div>
      </div>
    </div>
  );
};

export default PrintComponent;
