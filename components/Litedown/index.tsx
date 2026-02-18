/**
 * LiteDown - Lightweight Markdown Renderer
 *
 * A self-contained, zero-config markdown renderer with:
 * - Syntax highlighting (Prism.js)
 * - Math rendering (Native MathML - W3C Standard)
 * - Diagram support (SVG-based)
 * - Dark theme by default
 * - Streaming support
 *
 * Just import and use - no external CSS required!
 */

import {
  memo,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  Fragment,
} from "react";
import Prism from "prismjs";
import { injectStyles } from "./styles";
import { MathBlock, latexToMathML } from "./MathBlock";
import type { LiteDownConfig, StreamingConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";

// Re-export types and MathBlock
export type { LiteDownConfig, StreamingConfig } from "./types";
export { DEFAULT_CONFIG } from "./types";
export { MathBlock, latexToMathML } from "./MathBlock";
export type { MathBlockProps } from "./MathBlock";

// ============================================================================
// UTILS
// ============================================================================

const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Language aliases
const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
};

// Loaded languages tracker
const loadedLangs = new Set(["javascript", "css", "markup", "clike"]);
const loadingLangs = new Map<string, Promise<void>>();

async function loadLanguage(lang: string): Promise<void> {
  const normalized = LANG_ALIASES[lang] || lang;
  if (loadedLangs.has(normalized) || Prism.languages[normalized]) {
    loadedLangs.add(normalized);
    return;
  }
  if (loadingLangs.has(normalized)) {
    return loadingLangs.get(normalized);
  }

  const promise = (async () => {
    try {
      switch (normalized) {
        case "typescript":
          await import("prismjs/components/prism-typescript");
          break;
        case "python":
          await import("prismjs/components/prism-python");
          break;
        case "bash":
          await import("prismjs/components/prism-bash");
          break;
        case "json":
          await import("prismjs/components/prism-json");
          break;
        case "yaml":
          await import("prismjs/components/prism-yaml");
          break;
        case "sql":
          await import("prismjs/components/prism-sql");
          break;
        case "rust":
          await import("prismjs/components/prism-rust");
          break;
        case "go":
          await import("prismjs/components/prism-go");
          break;
        case "java":
          await import("prismjs/components/prism-java");
          break;
        case "markdown":
          await import("prismjs/components/prism-markdown");
          break;
      }
      loadedLangs.add(normalized);
    } catch {
      // Language not available
    }
  })();

  loadingLangs.set(normalized, promise);
  return promise;
}

// ============================================================================
// CODE BLOCK COMPONENT
// ============================================================================

interface CodeBlockProps {
  code: string;
  language: string;
  theme: "dark" | "light";
  showCopy: boolean;
  showLineNumbers: boolean;
}

const CodeBlock = memo<CodeBlockProps>(
  ({ code, language, theme, showCopy, showLineNumbers }) => {
    const [highlighted, setHighlighted] = useState("");
    const [copied, setCopied] = useState(false);
    const copyTimeout = useRef<number>(0);
    const lang = LANG_ALIASES[language] || language || "text";

    useEffect(() => {
      let cancelled = false;

      const doHighlight = async () => {
        await loadLanguage(lang);
        if (cancelled) return;

        const grammar = Prism.languages[lang];
        if (grammar) {
          setHighlighted(Prism.highlight(code, grammar, lang));
        } else {
          setHighlighted(escapeHtml(code));
        }
      };

      doHighlight();
      return () => {
        cancelled = true;
      };
    }, [code, lang]);

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
        copyTimeout.current = window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
      }
    }, [code]);

    useEffect(() => {
      return () => {
        if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
      };
    }, []);

    const lines = code.split("\n");

    return (
      <div className={`litedown-code-block litedown-${theme}`}>
        <div className="litedown-code-header">
          <span>{lang}</span>
          {showCopy && (
            <button className="litedown-copy-btn" onClick={handleCopy}>
              {copied ? (
                <Fragment>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied!</span>
                </Fragment>
              ) : (
                <Fragment>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </Fragment>
              )}
            </button>
          )}
        </div>
        <pre>
          <code>
            {showLineNumbers && (
              <span className="litedown-line-numbers">
                {lines.map((_, i) => (
                  <Fragment key={i}>
                    {i + 1}
                    {i < lines.length - 1 && "\n"}
                  </Fragment>
                ))}
              </span>
            )}
            <span
              dangerouslySetInnerHTML={{
                __html: highlighted || escapeHtml(code),
              }}
            />
          </code>
        </pre>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

// ============================================================================
// DIAGRAM COMPONENT
// ============================================================================

interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

function parseDiagram(code: string): {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
} {
  const lines = code
    .trim()
    .split("\n")
    .filter((l) => l.trim() && !l.trim().match(/^(flowchart|graph)/i));
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const nodeMap = new Map<string, DiagramNode>();
  let col = 0;

  for (const line of lines) {
    const match = line.match(
      /(\w+)(?:\[([^\]]+)\])?\s*(-->|---)\s*(?:\|([^|]+)\|)?\s*(\w+)(?:\[([^\]]+)\])?/,
    );
    if (match) {
      const [, fromId, fromLabel, , edgeLabel, toId, toLabel] = match;

      if (!nodeMap.has(fromId)) {
        const node = {
          id: fromId,
          label: fromLabel || fromId,
          x: 80 + (col % 3) * 150,
          y: 50 + Math.floor(col / 3) * 80,
        };
        nodeMap.set(fromId, node);
        nodes.push(node);
        col++;
      }

      if (!nodeMap.has(toId)) {
        const node = {
          id: toId,
          label: toLabel || toId,
          x: 80 + (col % 3) * 150,
          y: 50 + Math.floor(col / 3) * 80,
        };
        nodeMap.set(toId, node);
        nodes.push(node);
        col++;
      }

      edges.push({ from: fromId, to: toId, label: edgeLabel?.trim() });
    }
  }

  return { nodes, edges };
}

interface DiagramProps {
  code: string;
  theme: "dark" | "light";
}

const Diagram = memo<DiagramProps>(({ code, theme }) => {
  const { nodes, edges } = useMemo(() => parseDiagram(code), [code]);

  if (nodes.length === 0) {
    return (
      <div className={`litedown-diagram litedown-${theme}`}>
        <pre style={{ textAlign: "left", fontSize: "0.875em" }}>{code}</pre>
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const width = Math.max(...nodes.map((n) => n.x)) + 150;
  const height = Math.max(...nodes.map((n) => n.y)) + 80;

  const nodeColor = theme === "dark" ? "#1e293b" : "#f8fafc";
  const borderColor = theme === "dark" ? "#6366f1" : "#4f46e5";
  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const edgeColor = theme === "dark" ? "#6b7280" : "#9ca3af";

  return (
    <div className={`litedown-diagram litedown-${theme}`}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <marker
            id="litedown-arrow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={edgeColor} />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const from = nodeMap.get(edge.from);
          const to = nodeMap.get(edge.to);
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / dist) * 50;
          const offsetY = (dy / dist) * 20;

          return (
            <g key={i}>
              <line
                x1={from.x + offsetX}
                y1={from.y + offsetY}
                x2={to.x - offsetX}
                y2={to.y - offsetY}
                stroke={edgeColor}
                strokeWidth="2"
                markerEnd="url(#litedown-arrow)"
              />
              {edge.label && (
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 8}
                  textAnchor="middle"
                  fill={edgeColor}
                  fontSize="11"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((node) => {
          const w = Math.max(80, node.label.length * 8 + 24);
          return (
            <g key={node.id}>
              <rect
                x={node.x - w / 2}
                y={node.y - 18}
                width={w}
                height={36}
                rx="6"
                fill={nodeColor}
                stroke={borderColor}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fill={textColor}
                fontSize="12"
                fontFamily="system-ui, sans-serif"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

Diagram.displayName = "Diagram";

// ============================================================================
// MARKDOWN PARSER
// ============================================================================

interface ParsedBlock {
  type: "html" | "code" | "math" | "diagram";
  content: string;
  language?: string;
  key: string;
}

function parseMarkdown(
  content: string,
  config: Required<LiteDownConfig>,
): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  let keyId = 0;
  const genKey = () => `block-${keyId++}`;

  // Pre-process: extract code blocks, math blocks, diagrams
  const lines = content.split("\n");
  let i = 0;
  let htmlBuffer = "";

  const flushHtml = () => {
    if (htmlBuffer.trim()) {
      blocks.push({
        type: "html",
        content: parseInlineMarkdown(htmlBuffer, config),
        key: genKey(),
      });
      htmlBuffer = "";
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      flushHtml();
      const lang = line.slice(3).trim();
      let code = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code += lines[i] + "\n";
        i++;
      }
      i++; // skip closing ```

      if (
        config.diagrams &&
        ["mermaid", "diagram", "flowchart"].includes(lang.toLowerCase())
      ) {
        blocks.push({ type: "diagram", content: code.trim(), key: genKey() });
      } else if (config.syntaxHighlight) {
        blocks.push({
          type: "code",
          content: code.trimEnd(),
          language: lang || "text",
          key: genKey(),
        });
      } else {
        htmlBuffer += `<pre><code>${escapeHtml(code.trimEnd())}</code></pre>\n`;
      }
      continue;
    }

    // Math block $$...$$
    if (line.startsWith("$$") && config.math) {
      flushHtml();
      let math = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("$$")) {
        math += lines[i] + "\n";
        i++;
      }
      i++; // skip closing $$
      console.log("Raw math block extracted:");
      console.log(math.substring(0, 200));
      console.log("Has \\begin?", math.includes("\\begin"));
      console.log("Has begin?", math.includes("begin"));
      blocks.push({ type: "math", content: math.trim(), key: genKey() });
      continue;
    }

    htmlBuffer += line + "\n";
    i++;
  }

  flushHtml();
  return blocks;
}

function parseInlineMarkdown(
  content: string,
  config: Required<LiteDownConfig>,
): string {
  let html = content;

  // Headings
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, text) => {
    const level = hashes.length;
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `<h${level} id="${id}">${parseInline(text, config)}</h${level}>`;
  });

  // Horizontal rule
  html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, "<hr />");

  // Blockquotes - multi-line support
  html = html.replace(/^(?:>\s?.+\n?)+/gm, (match) => {
    const content = match.replace(/^>\s?/gm, "").trim();
    return `<blockquote>${parseInline(content, config)}</blockquote>\n`;
  });

  // Unordered lists
  html = html.replace(/^([\*\-]\s+.+(\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => {
        const content = line.replace(/^[\*\-]\s+/, "");
        // Task list
        const taskMatch = content.match(/^\[([ xX])\]\s+(.+)$/);
        if (taskMatch) {
          const checked = taskMatch[1] !== " " ? " checked" : "";
          return `<li class="task-list-item"><input type="checkbox"${checked} disabled />${parseInline(taskMatch[2], config)}</li>`;
        }
        return `<li>${parseInline(content, config)}</li>`;
      });
    return `<ul>${items.join("")}</ul>\n`;
  });

  // Ordered lists
  html = html.replace(/^(\d+\.\s+.+(\n|$))+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => {
        const content = line.replace(/^\d+\.\s+/, "");
        return `<li>${parseInline(content, config)}</li>`;
      });
    return `<ol>${items.join("")}</ol>\n`;
  });

  // Tables
  html = html.replace(/^\|.+\|\n\|[-:\s|]+\|\n(\|.+\|\n?)+/gm, (match) => {
    const rows = match.trim().split("\n");
    const headers = rows[0]
      .split("|")
      .slice(1, -1)
      .map((h) => h.trim());
    const alignRow = rows[1].split("|").slice(1, -1);
    const aligns = alignRow.map((cell) => {
      if (cell.startsWith(":") && cell.endsWith(":")) return "center";
      if (cell.endsWith(":")) return "right";
      return "left";
    });

    let table = "<table><thead><tr>";
    headers.forEach((h, i) => {
      table += `<th style="text-align:${aligns[i]}">${parseInline(h, config)}</th>`;
    });
    table += "</tr></thead><tbody>";

    for (let r = 2; r < rows.length; r++) {
      const cells = rows[r]
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      table += "<tr>";
      cells.forEach((c, i) => {
        table += `<td style="text-align:${aligns[i] || "left"}">${parseInline(c, config)}</td>`;
      });
      table += "</tr>";
    }

    table += "</tbody></table>";
    return table + "\n";
  });

  // Paragraphs - wrap remaining text
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, (_, text) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    return `<p>${parseInline(trimmed, config)}</p>`;
  });

  // Clean up extra blank lines
  html = html.replace(/\n{3,}/g, "\n\n");

  return html;
}

function parseInline(text: string, config: Required<LiteDownConfig>): string {
  let result = text;

  // Images (before links)
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" />',
  );

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  result = result.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Strikethrough
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Inline code
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Inline math $...$ - use the MathBlock's latexToMathML function
  if (config.math) {
    result = result.replace(/\$([^$\n]+)\$/g, (_, math) => {
      return latexToMathML(math, "inline");
    });
  }

  return result;
}

// ============================================================================
// MAIN LITEDOWN COMPONENT
// ============================================================================

interface LiteDownProps {
  content: string;
  config?: LiteDownConfig;
  className?: string;
}

function LiteDownComponent({
  content,
  config = {},
  className = "",
}: LiteDownProps) {
  const mergedConfig = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config],
  );

  // Inject styles on first render
  useEffect(() => {
    injectStyles();
  }, []);

  const blocks = useMemo(
    () => parseMarkdown(content, mergedConfig),
    [content, mergedConfig],
  );

  const themeClass = `litedown-${mergedConfig.theme}`;

  return (
    <div
      className={`whitespace-nowrap litedown ${themeClass} ${className}`.trim()}
    >
      {blocks.map((block) => {
        switch (block.type) {
          case "code":
            return (
              <CodeBlock
                key={block.key}
                code={block.content}
                language={block.language || "text"}
                theme={mergedConfig.theme}
                showCopy={mergedConfig.copyButton}
                showLineNumbers={mergedConfig.lineNumbers}
              />
            );

          case "math":
            return (
              <MathBlock
                key={block.key}
                content={block.content}
                display="block"
                className={`litedown-math litedown-${mergedConfig.theme}`}
              />
            );

          case "diagram":
            return (
              <Diagram
                key={block.key}
                code={block.content}
                theme={mergedConfig.theme}
              />
            );

          case "html":
            return (
              <div
                className="text whitespace-normal"
                key={block.key}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export const LiteDown = memo(LiteDownComponent);

// ============================================================================
// STREAMING COMPONENT
// ============================================================================

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
  className = "",
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
      result += "\n```";
    }

    // Close unclosed math blocks
    const mathBlocks = (result.match(/\$\$/g) || []).length;
    if (mathBlocks % 2 !== 0) {
      result += "\n$$";
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

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for simulating streaming content (useful for demos)
 */
export function useStreamingDemo(fullContent: string, charsPerChunk = 5) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<number>(0);

  const progress =
    fullContent.length > 0 ? content.length / fullContent.length : 0;

  const start = useCallback(() => {
    setContent("");
    setIsStreaming(true);
    setIsPaused(false);
    indexRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      if (indexRef.current >= fullContent.length) {
        window.clearInterval(intervalRef.current);
        setIsStreaming(false);
        return;
      }

      const end = Math.min(
        indexRef.current + charsPerChunk,
        fullContent.length,
      );
      setContent(fullContent.slice(0, end));
      indexRef.current = end;
    }, 30);
  }, [fullContent, charsPerChunk]);

  const pause = useCallback(() => {
    window.clearInterval(intervalRef.current);
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!isPaused) return;
    setIsPaused(false);

    intervalRef.current = window.setInterval(() => {
      if (indexRef.current >= fullContent.length) {
        window.clearInterval(intervalRef.current);
        setIsStreaming(false);
        return;
      }

      const end = Math.min(
        indexRef.current + charsPerChunk,
        fullContent.length,
      );
      setContent(fullContent.slice(0, end));
      indexRef.current = end;
    }, 30);
  }, [fullContent, charsPerChunk, isPaused]);

  const reset = useCallback(() => {
    window.clearInterval(intervalRef.current);
    setContent("");
    setIsStreaming(false);
    setIsPaused(false);
    indexRef.current = 0;
  }, []);

  const complete = useCallback(() => {
    window.clearInterval(intervalRef.current);
    setContent(fullContent);
    setIsStreaming(false);
    setIsPaused(false);
    indexRef.current = fullContent.length;
  }, [fullContent]);

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current);
    };
  }, []);

  return {
    content,
    isStreaming,
    isPaused,
    progress,
    start,
    pause,
    resume,
    reset,
    complete,
  };
}

/**
 * Hook for real API streaming
 */
export function useAsyncStream() {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startManualStream = useCallback(() => {
    setIsStreaming(true);
    setContent("");
    abortRef.current = new AbortController();
  }, []);

  const appendContent = useCallback((chunk: string) => {
    setContent((prev) => prev + chunk);
  }, []);

  const endStream = useCallback(() => {
    setIsStreaming(false);
    abortRef.current = null;
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abort();
    setContent("");
  }, [abort]);

  return {
    content,
    isStreaming,
    startManualStream,
    appendContent,
    endStream,
    abort,
    reset,
  };
}

// Default export
export default LiteDown;
