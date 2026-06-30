import {
  Badge,
  cn,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@examplary/ui";
import { ChevronDownIcon } from "lucide-react";
import { LABELS } from "../shared";

type LabelDropdownProps = {
  t: (key: string | string[], options?: any) => string;
  value: string | null;
  onChange: (newLabel: string | null) => void;
  enabledLabels: string[];
};

export const LabelDropdown = ({
  value,
  onChange,
  enabledLabels,
  t,
}: LabelDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="ml-1 -mr-1.5 rounded-2xl px-1.5 h-6 text-[10px] font-bold text-zinc-700/80 hover:bg-black/5 data-[state=open]:bg-black/5 hover:text-black flex items-center"
          title={value ? (LABELS.find((label) => label.code === value)?.nl ?? value) : t("no-label")}
        >
          {value || "..."}
          <ChevronDownIcon className="ml-0.5 h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {LABELS.filter((label) => enabledLabels.includes(label.code)).map(
          (label) => {
            return (
              <DropdownMenuCheckboxItem
                key={label.code}
                checked={value === label.code}
                onCheckedChange={(checked) =>
                  onChange(checked ? label.code : null)
                }
              >
                <Badge className={cn(label?.color, "mr-1.5")}>
                  {label.code}
                </Badge>{" "}
                {label.nl || label.code}
              </DropdownMenuCheckboxItem>
            );
          },
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
