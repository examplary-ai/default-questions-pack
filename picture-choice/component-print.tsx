import { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ question }) => {
  const options = question.settings.options || [];
  const validOptions = options.filter((option) => option.imageUrl);

  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      {validOptions.map((option, index) => (
        <div key={index} className="flex flex-col gap-2 items-center">
          <div className="flex gap-2 items-center">
            <div className="aspect-square size-5 rounded-full border-2 border-border" />
            <span className="text-sm">{String.fromCharCode(65 + index)}</span>
          </div>
          <div className="w-32 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">Image {index + 1}</span>
          </div>
          {option.imageName && (
            <div className="text-xs text-gray-600 text-center max-w-32 truncate">
              {option.imageName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrintComponent;
