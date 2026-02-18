/**
 * LiteDown Styles - Self-contained CSS-in-JS styles
 * These styles are injected automatically, no external CSS required
 */

// const LITEDOWN_STYLES = `
// /* LiteDown Base Styles */
// .litedown {
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
//   line-height: 1.7;
//   font-size: 1rem;
// }

// /* Dark theme (default) */
// .litedown.litedown-dark {
//   color: #e2e8f0;
// }
// .litedown.litedown-dark a { color: #60a5fa; }
// .litedown.litedown-dark a:hover { color: #93c5fd; }
// .litedown.litedown-dark blockquote {
//   border-left: 4px solid #6366f1;
//   background: rgba(99, 102, 241, 0.1);
// }
// .litedown.litedown-dark code:not([class*="language-"]) {
//   background: #1e293b;
//   border: 1px solid #334155;
// }
// .litedown.litedown-dark hr { border-color: #334155; }
// .litedown.litedown-dark th { background: #1e293b; }
// .litedown.litedown-dark tr:nth-child(even) { background: rgba(30, 41, 59, 0.5); }

// /* Light theme */
// .litedown.litedown-light {
//   color: #1e293b;
// }
// .litedown.litedown-light a { color: #2563eb; }
// .litedown.litedown-light a:hover { color: #1d4ed8; }
// .litedown.litedown-light blockquote {
//   border-left: 4px solid #6366f1;
//   background: rgba(99, 102, 241, 0.05);
// }
// .litedown.litedown-light code:not([class*="language-"]) {
//   background: #f1f5f9;
//   border: 1px solid #e2e8f0;
// }
// .litedown.litedown-light hr { border-color: #e2e8f0; }
// .litedown.litedown-light th { background: #f8fafc; }
// .litedown.litedown-light tr:nth-child(even) { background: #f8fafc; }

// /* Typography */
// .litedown h1, .litedown h2, .litedown h3,
// .litedown h4, .litedown h5, .litedown h6 {
//   font-weight: 600;
//   line-height: 1.3;
//   margin-top: 1.5em;
//   margin-bottom: 0.5em;
// }
// .litedown h1:first-child, .litedown h2:first-child,
// .litedown h3:first-child { margin-top: 0; }

// .litedown h1 { font-size: 2em; }
// .litedown h2 { font-size: 1.5em; border-bottom: 1px solid currentColor; padding-bottom: 0.3em; opacity: 0.9; }
// .litedown h3 { font-size: 1.25em; }
// .litedown h4 { font-size: 1.1em; }
// .litedown h5 { font-size: 1em; }
// .litedown h6 { font-size: 0.9em; opacity: 0.8; }

// .litedown p { margin: 0 0 1em 0; }
// .litedown strong { font-weight: 600; }
// .litedown em { font-style: italic; }
// .litedown del { text-decoration: line-through; opacity: 0.7; }

// /* Links */
// .litedown a { text-decoration: none; }
// .litedown a:hover { text-decoration: underline; }

// /* Inline code */
// .litedown code:not([class*="language-"]) {
//   font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
//   font-size: 0.875em;
//   padding: 0.2em 0.4em;
//   border-radius: 4px;
// }

// /* Lists */
// .litedown ul, .litedown ol {
//   margin: 0 0 1em 0;
//   padding-left: 1.5em;
// }
// .litedown ul { list-style-type: disc; }
// .litedown ol { list-style-type: decimal; }
// .litedown li { margin-bottom: 0.25em; }
// .litedown li > ul, .litedown li > ol { margin: 0.25em 0; }

// /* Task lists */
// .litedown .task-list-item {
//   list-style: none;
//   margin-left: -1.5em;
//   display: flex;
//   align-items: flex-start;
//   gap: 0.5em;
// }
// .litedown .task-list-item input[type="checkbox"] {
//   margin-top: 0.35em;
//   pointer-events: none;
// }

// /* Blockquotes */
// .litedown blockquote {
//   margin: 1em 0;
//   padding: 0.5em 1em;
//   border-radius: 0 4px 4px 0;
// }
// .litedown blockquote p:last-child { margin-bottom: 0; }

// /* Horizontal rule */
// .litedown hr {
//   border: none;
//   border-top: 1px solid;
//   margin: 2em 0;
// }

// /* Tables */
// .litedown table {
//   width: 100%;
//   border-collapse: collapse;
//   margin: 1em 0;
//   font-size: 0.9em;
// }
// .litedown th, .litedown td {
//   padding: 0.5em 0.75em;
//   border: 1px solid currentColor;
//   border-color: inherit;
//   opacity: 0.8;
// }
// .litedown th {
//   font-weight: 600;
//   text-align: left;
// }

// /* Images */
// .litedown img {
//   max-width: 100%;
//   height: auto;
//   border-radius: 4px;
//   margin: 1em 0;
// }

// /* Code block wrapper */
// .litedown-code-block {
//   margin: 1em 0;
//   border-radius: 8px;
//   overflow: hidden;
// }
// .litedown-dark .litedown-code-block {
//   background: #0f172a;
//   border: 1px solid #1e293b;
// }
// .litedown-light .litedown-code-block {
//   background: #f8fafc;
//   border: 1px solid #e2e8f0;
// }

// .litedown-code-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 0.5em 1em;
//   font-size: 0.75em;
//   font-weight: 500;
//   text-transform: uppercase;
//   letter-spacing: 0.05em;
// }
// .litedown-dark .litedown-code-header {
//   background: #1e293b;
//   color: #94a3b8;
//   border-bottom: 1px solid #334155;
// }
// .litedown-light .litedown-code-header {
//   background: #f1f5f9;
//   color: #64748b;
//   border-bottom: 1px solid #e2e8f0;
// }

// .litedown-copy-btn {
//   background: transparent;
//   border: none;
//   cursor: pointer;
//   padding: 0.25em 0.5em;
//   border-radius: 4px;
//   display: flex;
//   align-items: center;
//   gap: 0.25em;
//   font-size: 1em;
//   transition: background 0.2s;
// }
// .litedown-dark .litedown-copy-btn { color: #94a3b8; }
// .litedown-dark .litedown-copy-btn:hover { background: #334155; color: #e2e8f0; }
// .litedown-light .litedown-copy-btn { color: #64748b; }
// .litedown-light .litedown-copy-btn:hover { background: #e2e8f0; color: #1e293b; }

// .litedown-code-block pre {
//   margin: 0;
//   padding: 1em;
//   overflow-x: auto;
//   font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
//   font-size: 0.875em;
//   line-height: 1.6;
// }
// .litedown-dark .litedown-code-block pre { color: #e2e8f0; }
// .litedown-light .litedown-code-block pre { color: #1e293b; }

// .litedown-code-block code {
//   display: flex;
// }

// .litedown-line-numbers {
//   user-select: none;
//   text-align: right;
//   padding-right: 1em;
//   margin-right: 1em;
//   min-width: 2em;
// }
// .litedown-dark .litedown-line-numbers { color: #475569; border-right: 1px solid #334155; }
// .litedown-light .litedown-line-numbers { color: #94a3b8; border-right: 1px solid #e2e8f0; }

// /* Math - Native MathML Styling */
// /* MathML is rendered natively by the browser - these styles enhance appearance */

// /* Block math display */
// .litedown-math {
//   margin: 1.5em 0;
//   padding: 1.25em;
//   text-align: center;
//   border-radius: 8px;
//   overflow-x: auto;
// }
// .litedown-dark .litedown-math { background: rgba(30, 41, 59, 0.5); }
// .litedown-light .litedown-math { background: #f8fafc; }

// /* MathML styling - works in all modern browsers */
// .litedown math {
//   font-family: 'STIX Two Math', 'Cambria Math', 'Latin Modern Math', 'Times New Roman', serif;
//   font-size: 1.1em;
// }

// /* Block math - larger and centered */
// .litedown-math math[display="block"] {
//   display: block;
//   font-size: 1.3em;
//   margin: 0 auto;
// }

// /* Inline math - proper vertical alignment */
// .litedown math:not([display="block"]) {
//   vertical-align: middle;
// }

// /* Fraction styling */
// .litedown mfrac {
//   vertical-align: middle;
// }

// /* Make sure square roots look good */
// .litedown msqrt,
// .litedown mroot {
//   vertical-align: middle;
// }

// /* Big operators */
// .litedown mo {
//   padding: 0 0.1em;
// }

// /* Improve spacing around operators */
// /* .litedown mrow > mo {
//   padding: 0 0.15em;
// } */

// /* Identifiers (variables) - italic by default in MathML */
// .litedown mi {
//   font-style: italic;
// }

// /* Normal (upright) text in math */
// .litedown mi[mathvariant="normal"] {
//   font-style: normal;
// }

// /* Numbers */
// .litedown mn {
//   font-style: normal;
// }

// /* Improve over/under scripts */
// .litedown mover,
// .litedown munder,
// .litedown munderover {
//   vertical-align: middle;
// }

// /* Stretchy brackets */
// .litedown mo[stretchy="true"] {
//   vertical-align: middle;
// }

// /* Diagram block */
// .litedown-diagram {
//   margin: 1em 0;
//   padding: 1em;
//   border-radius: 8px;
//   text-align: center;
//   overflow-x: auto;
// }
// .litedown-dark .litedown-diagram { background: rgba(30, 41, 59, 0.5); }
// .litedown-light .litedown-diagram { background: #f8fafc; }

// /* Prism token colors - Dark theme */
// .litedown-dark .token.comment,
// .litedown-dark .token.prolog,
// .litedown-dark .token.doctype,
// .litedown-dark .token.cdata { color: #6b7280; font-style: italic; }
// .litedown-dark .token.punctuation { color: #9ca3af; }
// .litedown-dark .token.property,
// .litedown-dark .token.tag,
// .litedown-dark .token.boolean,
// .litedown-dark .token.number,
// .litedown-dark .token.constant,
// .litedown-dark .token.symbol,
// .litedown-dark .token.deleted { color: #7dd3fc; }
// .litedown-dark .token.selector,
// .litedown-dark .token.attr-name,
// .litedown-dark .token.string,
// .litedown-dark .token.char,
// .litedown-dark .token.builtin,
// .litedown-dark .token.inserted { color: #86efac; }
// .litedown-dark .token.operator,
// .litedown-dark .token.entity,
// .litedown-dark .token.url,
// .litedown-dark .language-css .token.string,
// .litedown-dark .style .token.string { color: #fca5a5; }
// .litedown-dark .token.atrule,
// .litedown-dark .token.attr-value,
// .litedown-dark .token.keyword { color: #c4b5fd; }
// .litedown-dark .token.function,
// .litedown-dark .token.class-name { color: #fcd34d; }
// .litedown-dark .token.regex,
// .litedown-dark .token.important,
// .litedown-dark .token.variable { color: #fdba74; }

// /* Prism token colors - Light theme */
// .litedown-light .token.comment,
// .litedown-light .token.prolog,
// .litedown-light .token.doctype,
// .litedown-light .token.cdata { color: #6b7280; font-style: italic; }
// .litedown-light .token.punctuation { color: #374151; }
// .litedown-light .token.property,
// .litedown-light .token.tag,
// .litedown-light .token.boolean,
// .litedown-light .token.number,
// .litedown-light .token.constant,
// .litedown-light .token.symbol,
// .litedown-light .token.deleted { color: #0369a1; }
// .litedown-light .token.selector,
// .litedown-light .token.attr-name,
// .litedown-light .token.string,
// .litedown-light .token.char,
// .litedown-light .token.builtin,
// .litedown-light .token.inserted { color: #15803d; }
// .litedown-light .token.operator,
// .litedown-light .token.entity,
// .litedown-light .token.url,
// .litedown-light .language-css .token.string,
// .litedown-light .style .token.string { color: #dc2626; }
// .litedown-light .token.atrule,
// .litedown-light .token.attr-value,
// .litedown-light .token.keyword { color: #7c3aed; }
// .litedown-light .token.function,
// .litedown-light .token.class-name { color: #b45309; }
// .litedown-light .token.regex,
// .litedown-light .token.important,
// .litedown-light .token.variable { color: #c2410c; }
// `;
const LITEDOWN_STYLES = `
/* LiteDown Base Styles */
.litedown {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  white-space: nowrap;
}

/* Dark theme (default) */
.litedown.litedown-dark {
  color: #e2e8f0;
}
.litedown.litedown-dark a { color: #60a5fa; }
.litedown.litedown-dark a:hover { color: #93c5fd; }
.litedown.litedown-dark blockquote {
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.1);
}
.litedown.litedown-dark hr { border-color: #334155; }
.litedown.litedown-dark th { background: #1e293b; }
.litedown.litedown-dark tr:nth-child(even) { background: rgba(30, 41, 59, 0.5); }

/* Light theme */
.litedown.litedown-light {
  color: #1e293b;
}
.litedown.litedown-light a { color: #2563eb; }
.litedown.litedown-light a:hover { color: #1d4ed8; }
.litedown.litedown-light blockquote {
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.05);
}
.litedown.litedown-light hr { border-color: #e2e8f0; }
.litedown.litedown-light th { background: #f8fafc; }
.litedown.litedown-light tr:nth-child(even) { background: #f8fafc; }

/* Typography */
.litedown h1, .litedown h2, .litedown h3,
.litedown h4, .litedown h5, .litedown h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 0.5rem;
}
.litedown h1:first-child, .litedown h2:first-child,
.litedown h3:first-child { margin-top: 0; }

.litedown h1 { font-size: 2em; }
.litedown h2 { font-size: 1.5em; }
.litedown h3 { font-size: 1.25em; }
.litedown h4 { font-size: 1.1em; }
.litedown h5 { font-size: 1em; }
.litedown h6 { font-size: 0.9em; opacity: 0.8; }

.litedown > p { white-space: nowrap; }
.litedown p { margin: 0 0 1em 0; }
.litedown strong { font-weight: 600; }
.litedown em { font-style: italic; }
.litedown del { text-decoration: line-through; opacity: 0.7; }

/* Links */
.litedown a { text-decoration: none; }
.litedown a:hover { text-decoration: underline; }

/* Inline code */
.litedown code:not([class*="language-"]) {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

/* Lists */
.litedown ul, .litedown ol {
  margin: 0 0 1em 0;
  padding-left: 1.5em;
}
.litedown ul { list-style-type: disc; }
.litedown ol { list-style-type: decimal; }
.litedown li { margin-bottom: 0.25em; }
.litedown li > ul, .litedown li > ol { margin: 0.25em 0; }

/* Task lists */
.litedown .task-list-item {
  list-style: none;
  margin-left: -1.5em;
  display: flex;
  align-items: flex-start;
  gap: 0.5em;
}
.litedown .task-list-item input[type="checkbox"] {
  margin-top: 0.35em;
  pointer-events: none;
}

/* Blockquotes */
.litedown blockquote {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-radius: 0 4px 4px 0;
}
.litedown blockquote p:last-child { margin-bottom: 0; }

/* Horizontal rule */
.litedown hr {
  border: none;
  border-top: 1px solid;
  margin: 1em 0;
}

/* Tables */
.litedown table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 0.9em;
}
.litedown th, .litedown td {
  padding: 0.5em 0.75em;
  border: 1px solid currentColor;
  border-color: inherit;
  opacity: 0.8;
}
.litedown th {
  font-weight: 600;
  text-align: left;
}

/* Images */
.litedown img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

/* Code block wrapper */
.litedown-code-block {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
}
.litedown-dark .litedown-code-block {
  background: #0f172a;
  border: 1px solid #1e293b;
}
.litedown-light .litedown-code-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.litedown-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 1em;
  font-size: 0.75em;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.litedown-dark .litedown-code-header {
  background: #1e293b;
  color: #94a3b8;
  border-bottom: 1px solid #334155;
}
.litedown-light .litedown-code-header {
  background: #f1f5f9;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.litedown-copy-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25em 0.5em;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25em;
  font-size: 1em;
  transition: background 0.2s;
}
.litedown-dark .litedown-copy-btn { color: #94a3b8; }
.litedown-dark .litedown-copy-btn:hover { background: #334155; color: #e2e8f0; }
.litedown-light .litedown-copy-btn { color: #64748b; }
.litedown-light .litedown-copy-btn:hover { background: #e2e8f0; color: #1e293b; }

.litedown-code-block pre {
  margin: 0;
  padding: 1em;
  overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.875em;
  line-height: 1.6;
}
.litedown-dark .litedown-code-block pre { color: #e2e8f0; }
.litedown-light .litedown-code-block pre { color: #1e293b; }

.litedown-code-block code {
  display: flex;
}

.litedown-line-numbers {
  user-select: none;
  text-align: right;
  padding-right: 1em;
  margin-right: 1em;
  min-width: 2em;
}
.litedown-dark .litedown-line-numbers { color: #475569; border-right: 1px solid #334155; }
.litedown-light .litedown-line-numbers { color: #94a3b8; border-right: 1px solid #e2e8f0; }

/* Block math - larger and centered */
.litedown-math math[display="block"] {
  font-size: 1.3em;
  margin: 2rem auto;
}
  
/* Diagram block */
.litedown-diagram {
  margin: 1em 0;
  padding: 1em;
  border-radius: 8px;
  text-align: center;
  overflow-x: auto;
}

.litedown-dark .litedown-diagram { background: rgba(30, 41, 59, 0.5); }
.litedown-light .litedown-diagram { background: #f8fafc; }

/* Prism token colors - Dark theme */
.litedown-dark .token.comment,
.litedown-dark .token.prolog,
.litedown-dark .token.doctype,
.litedown-dark .token.cdata { color: #6b7280; font-style: italic; }
.litedown-dark .token.punctuation { color: #9ca3af; }
.litedown-dark .token.property,
.litedown-dark .token.tag,
.litedown-dark .token.boolean,
.litedown-dark .token.number,
.litedown-dark .token.constant,
.litedown-dark .token.symbol,
.litedown-dark .token.deleted { color: #7dd3fc; }
.litedown-dark .token.selector,
.litedown-dark .token.attr-name,
.litedown-dark .token.string,
.litedown-dark .token.char,
.litedown-dark .token.builtin,
.litedown-dark .token.inserted { color: #86efac; }
.litedown-dark .token.operator,
.litedown-dark .token.entity,
.litedown-dark .token.url,
.litedown-dark .language-css .token.string,
.litedown-dark .style .token.string { color: #fca5a5; }
.litedown-dark .token.atrule,
.litedown-dark .token.attr-value,
.litedown-dark .token.keyword { color: #c4b5fd; }
.litedown-dark .token.function,
.litedown-dark .token.class-name { color: #fcd34d; }
.litedown-dark .token.regex,
.litedown-dark .token.important,
.litedown-dark .token.variable { color: #fdba74; }

/* Prism token colors - Light theme */
.litedown-light .token.comment,
.litedown-light .token.prolog,
.litedown-light .token.doctype,
.litedown-light .token.cdata { color: #6b7280; font-style: italic; }
.litedown-light .token.punctuation { color: #374151; }
.litedown-light .token.property,
.litedown-light .token.tag,
.litedown-light .token.boolean,
.litedown-light .token.number,
.litedown-light .token.constant,
.litedown-light .token.symbol,
.litedown-light .token.deleted { color: #0369a1; }
.litedown-light .token.selector,
.litedown-light .token.attr-name,
.litedown-light .token.string,
.litedown-light .token.char,
.litedown-light .token.builtin,
.litedown-light .token.inserted { color: #15803d; }
.litedown-light .token.operator,
.litedown-light .token.entity,
.litedown-light .token.url,
.litedown-light .language-css .token.string,
.litedown-light .style .token.string { color: #dc2626; }
.litedown-light .token.atrule,
.litedown-light .token.attr-value,
.litedown-light .token.keyword { color: #7c3aed; }
.litedown-light .token.function,
.litedown-light .token.class-name { color: #b45309; }
.litedown-light .token.regex,
.litedown-light .token.important,
.litedown-light .token.variable { color: #c2410c; }
`;
let stylesInjected = false;

/**
 * Inject LiteDown styles into the document head.
 * This is called automatically when LiteDown is used.
 */
export function injectStyles(): void {
  if (stylesInjected || typeof document === "undefined") return;

  const style = document.createElement("style");
  style.id = "litedown-styles";
  style.textContent = LITEDOWN_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

export default injectStyles;
