import { cn } from "@examplary/ui";
import { Fragment } from "react";

import {
  LABELS,
  sameRange,
  setSegmentLabel,
  toggleBoundary,
  togglePersoonsvorm,
} from "../shared";
import type { SentenceParse, ZinsdeelCode } from "../shared";
import { LabelDropdown } from "./label-dropdown";
import { Tooltipped } from "./tooltipped";

type ParseEditorProps = {
  parse: SentenceParse;
  enabledLabels: ZinsdeelCode[];
  requirePersoonsvorm: boolean;
  onChange: (parse: SentenceParse) => void;
  t: (key: string | string[], options?: any) => string;
  reviewParse?: SentenceParse;
  className?: string;
  framed?: boolean;
};

const ParseEditor = ({
  parse,
  enabledLabels,
  requirePersoonsvorm,
  onChange,
  t,
  reviewParse,
  className,
  framed = false,
}: ParseEditorProps) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-y-3",
        framed && "rounded-lg border border-border p-3",
        className,
      )}
    >
      {parse.segments.map((segment, segmentIndex) => {
        const reviewSegment = reviewParse?.segments.find(
          (item) =>
            item.startToken === segment.startToken &&
            item.endToken === segment.endToken,
        );
        const correct = reviewSegment && reviewSegment.label === segment.label;
        const incorrect =
          reviewParse &&
          segment.label &&
          (!reviewSegment || reviewSegment.label !== segment.label);

        const label = LABELS.find((item) => item.code === segment.label);

        return (
          <div
            className="flex flex-wrap items-stretch"
            key={segment.startToken}
          >
            <div
              className={cn(
                "min-w-20 min-h-8 items-center flex shrink-0 rounded-3xl bg-accent px-2.5",
                correct && "border-green-300 bg-green-50",
                incorrect && "border-red-200 bg-red-50",
                !correct && !incorrect && label?.color,
              )}
            >
              <div className="flex flex-wrap gap-x-1 gap-y-1">
                {parse.tokens
                  .slice(segment.startToken, segment.endToken + 1)
                  .map((token) => {
                    const isPv = sameRange(parse.persoonsvorm, {
                      startToken: token.index,
                      endToken: token.index,
                    });
                    const isReviewPv =
                      reviewParse &&
                      sameRange(reviewParse.persoonsvorm, {
                        startToken: token.index,
                        endToken: token.index,
                      });

                    return (
                      <Fragment key={token.index}>
                        <Tooltipped
                          content={
                            requirePersoonsvorm && !isPv
                              ? t("toggle-pv")
                              : undefined
                          }
                        >
                          <button
                            type="button"
                            disabled={!requirePersoonsvorm}
                            onClick={() =>
                              onChange(togglePersoonsvorm(parse, token.index))
                            }
                            className={cn(
                              "rounded px-0.5 text-sm leading-6",
                              requirePersoonsvorm &&
                                "hover:bg-white cursor-pointer",
                              isPv &&
                                "underline decoration-2 underline-offset-4",
                              isReviewPv && "text-green-800",
                            )}
                            title={
                              requirePersoonsvorm ? t("toggle-pv") : undefined
                            }
                          >
                            {token.text}
                          </button>
                        </Tooltipped>
                        {token.index < segment.endToken && (
                          <Tooltipped content={t("split-boundary")}>
                            <button
                              type="button"
                              onClick={() =>
                                onChange(toggleBoundary(parse, token.index))
                              }
                              className="mx-0.5 rounded px-1 text-xs text-zinc-500 cursor-pointer hover:bg-white hover:text-black"
                              title={t("split-boundary")}
                            >
                              |
                            </button>
                          </Tooltipped>
                        )}
                      </Fragment>
                    );
                  })}
              </div>
              <LabelDropdown
                t={t}
                value={segment.label}
                onChange={(newLabel) =>
                  onChange(
                    setSegmentLabel(
                      parse,
                      segmentIndex,
                      (newLabel as ZinsdeelCode) || null,
                    ),
                  )
                }
                enabledLabels={enabledLabels}
              />
              {reviewParse &&
                reviewSegment &&
                reviewSegment.label !== segment.label && (
                  <div className="mt-1 text-xs text-green-800">
                    {t("correct-label")}: {reviewSegment.label}
                  </div>
                )}
            </div>
            {segment.endToken < parse.tokens.length - 1 && (
              <Tooltipped content={t("merge-boundary")}>
                <button
                  type="button"
                  onClick={() =>
                    onChange(toggleBoundary(parse, segment.endToken))
                  }
                  className="flex w-4 mx-1 items-center justify-center cursor-pointer rounded-md text-sm text-zinc-500 hover:bg-zinc-100 hover:text-black"
                  title={t("merge-boundary")}
                >
                  +
                </button>
              </Tooltipped>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ParseEditor;
