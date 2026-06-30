import {
  cn,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@examplary/ui";

// TODO: eventually move this to use Tooltipped from @examplary/ui

export const Tooltipped = ({
  children,
  content,
  className = "",
  contentClassName = "",
  side = "top",
  asChild = true,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  contentClassName?: string;
  asChild?: boolean;
  side?: "top" | "right" | "bottom" | "left";
}) => {
  if (!content) return children;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger
          className={className}
          asChild={asChild}
          aria-description={typeof content === "string" ? content : undefined}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          className={cn("max-w-sm py-2", contentClassName)}
          side={side}
          sideOffset={10}
        >
          <div className="text-xs [&_svg]:size-4 [&_svg]:shrink-0 flex items-center gap-1.5">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
