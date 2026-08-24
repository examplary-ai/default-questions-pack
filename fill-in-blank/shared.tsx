import { RichTextDisplay } from "@examplary/ui";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

const BLANK = "___";

export const countBlanks = (text: string) => text.split(BLANK).length - 1;

// The question text is rich text, so it cannot be split on `___` and rendered
// as separate fragments: each fragment is unbalanced HTML that the browser
// silently repairs, closing block elements early — which drops the first
// blank onto its own line — and leaving stray empty ones behind. Swapping the
// blanks for empty placeholders keeps the markup well-formed instead.
const withPlaceholders = (text: string) => {
  let index = 0;
  return text.replaceAll(BLANK, () => `<span data-blank="${index++}"></span>`);
};

// Renders the question text with `renderBlank(index)` portalled into each
// blank, so the surrounding rich text stays a single well-formed document
export const BlankText = ({
  text,
  className,
  renderBlank,
}: {
  text: string;
  className?: string;
  renderBlank: (index: number) => ReactNode;
}) => {
  const html = useMemo(() => withPlaceholders(text || ""), [text]);

  // Memoised so React bails out of this subtree on later renders. Without it
  // every render re-applies dangerouslySetInnerHTML, which replaces the
  // placeholder nodes and leaves the portals mounted into detached elements.
  const richText = useMemo(
    () => <RichTextDisplay>{html}</RichTextDisplay>,
    [html],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [placeholders, setPlaceholders] = useState<HTMLElement[]>([]);

  useLayoutEffect(() => {
    const nodes =
      containerRef.current?.querySelectorAll<HTMLElement>("[data-blank]");
    setPlaceholders(nodes ? Array.from(nodes) : []);
  }, [html]);

  return (
    <div className={className} ref={containerRef}>
      {richText}
      {placeholders.map((placeholder, index) =>
        createPortal(renderBlank(index), placeholder, `blank-${index}`),
      )}
    </div>
  );
};
