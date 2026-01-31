
// ============================================================================
// STREAMING COMPONENT
// ============================================================================

import { memo, useEffect, useMemo, useRef, useState } from "react";
import LiteDown, { type StreamingConfig } from "./index.tsx";

interface StreamingLiteDownProps {
  content: string;
  isStreaming?: boolean;
  config?: StreamingConfig;
  className?: string;
}

function StreamingLiteDownComponent({
  content,
  isStreaming = false,
  config = {},
  className = '',
}: StreamingLiteDownProps) {
  const { debounceMs = 50, ...litedownConfig } = config;
  const [debouncedContent, setDebouncedContent] = useState(content);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);

    if (isStreaming && debounceMs > 0) {
      timerRef.current = window.setTimeout(() => {
        setDebouncedContent(content);
      }, debounceMs);
    } else {
      setDebouncedContent(content);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [content, isStreaming, debounceMs]);

  // Handle incomplete markdown during streaming
  const processedContent = useMemo(() => {
    if (!isStreaming) return debouncedContent;

    let result = debouncedContent;

    // Close unclosed code blocks
    const codeBlocks = (result.match(/```/g) || []).length;
    if (codeBlocks % 2 !== 0) {
      result += '\n```';
    }

    // Close unclosed math blocks
    const mathBlocks = (result.match(/\$\$/g) || []).length;
    if (mathBlocks % 2 !== 0) {
      result += '\n$$';
    }

    return result;
  }, [debouncedContent, isStreaming]);

  return (
    <LiteDown
      content={processedContent}
      config={litedownConfig}
      className={className}
    />
  );
}

export const StreamingLiteDown = memo(StreamingLiteDownComponent);