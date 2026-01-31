/**
 * LiteDown Types
 * A lightweight, self-contained markdown renderer
 */

export interface LiteDownConfig {
  /** Theme: 'dark' (default) or 'light' */
  theme?: 'dark' | 'light';
  /** Enable syntax highlighting */
  syntaxHighlight?: boolean;
  /** Enable math rendering */
  math?: boolean;
  /** Enable diagram rendering */
  diagrams?: boolean;
  /** Show copy button on code blocks */
  copyButton?: boolean;
  /** Show line numbers in code blocks */
  lineNumbers?: boolean;
  /** Custom class name */
  className?: string;
}

export const DEFAULT_CONFIG: Required<LiteDownConfig> = {
  theme: 'dark',
  syntaxHighlight: true,
  math: true,
  diagrams: true,
  copyButton: true,
  lineNumbers: false,
  className: '',
};

export interface StreamingConfig extends LiteDownConfig {
  /** Debounce delay in ms for streaming updates */
  debounceMs?: number;
}