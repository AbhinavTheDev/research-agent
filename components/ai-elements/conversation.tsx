"use client";

import { Button } from "@/components/ui/button";
import { cn } from "lib/utils";
import { ArrowDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useCallback, useContext } from "react";
import {
  useStickToBottom,
  type StickToBottomInstance,
} from "use-stick-to-bottom";

const StickToBottomContext = createContext<StickToBottomInstance | null>(null);

const StickToBottomProvider = ({
  children,
  ...options
}: { children: ReactNode } & Parameters<typeof useStickToBottom>[0]) => {
  const stickToBottom = useStickToBottom(options);
  return (
    <StickToBottomContext.Provider value={stickToBottom}>
      {children}
    </StickToBottomContext.Provider>
  );
};

export const useStickToBottomContext = () => {
  const context = useContext(StickToBottomContext);
  if (!context) {
    throw new Error(
      "useStickToBottomContext must be used within a StickToBottomProvider"
    );
  }
  return context;
};

const StickToBottomContent = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const { contentRef } = useStickToBottomContext();
  return <div ref={contentRef} className={className} {...props} />;
};

export type ConversationProps = ComponentProps<"div">;

export const Conversation = ({
  className,
  children,
  ...props
}: ConversationProps) => {
  return (
    <StickToBottomProvider initial="instant" resize="smooth">
      <ConversationScroller className={className} {...props}>
        {children}
      </ConversationScroller>
    </StickToBottomProvider>
  );
};

const ConversationScroller = ({
  className,
  children,
  ...props
}: ConversationProps) => {
  const { scrollRef } = useStickToBottomContext();
  return (
    <div
      ref={scrollRef}
      className={cn("relative flex-1", className)}
      role="log"
      {...props}
    >
      {children}
    </div>
  );
};

export type ConversationContentProps = ComponentProps<"div">;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottomContent
    className={cn("flex flex-col gap-8 p-4", className)}
    {...props}
  />
);

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "fixed bottom-40 left-[50%] translate-x-[-50%] rounded-full",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
