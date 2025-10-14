import { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ question }) => {
  const options = (question.settings.options || []).filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      {options.map((option, index) => (
        <div key={index} className="flex flex-col gap-2 items-center">
          <div className="flex gap-2 items-center">
            <div className="aspect-square size-5 rounded-full border border-black" />
            <span className="text-sm">{String.fromCharCode(65 + index)}</span>
          </div>
          <img
            src={option}
            alt={`Option ${index + 1}`}
            className="max-w-48 max-h-32 object-contain rounded border"
          />
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
