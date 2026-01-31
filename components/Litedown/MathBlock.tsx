/**
 * MathBlock Component
 * Converts LaTeX to MathML following W3C MathML Core spec
 * @see https://w3c.github.io/mathml-core/
 */

import React, { memo, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

interface MathBlockProps {
  /** LaTeX content (without $ delimiters) */
  content: string;
  /** Display mode: inline or block */
  display?: 'inline' | 'block';
  /** Optional className */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const GREEK_LETTERS: Record<string, string> = {
  // Lowercase
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  varepsilon: 'ɛ', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν',
  xi: 'ξ', omicron: 'ο', pi: 'π', varpi: 'ϖ', rho: 'ρ',
  varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ',
  phi: 'φ', varphi: 'ϕ', chi: 'χ', psi: 'ψ', omega: 'ω',
  // Uppercase
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
  Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ',
  Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ', Omicron: 'Ο',
  Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ', Upsilon: 'Υ',
  Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
};

const OPERATORS: Record<string, string> = {
  // Binary operators
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '·',
  ast: '∗', star: '⋆', circ: '∘', bullet: '•',
  // Relations
  eq: '=', ne: '≠', neq: '≠', lt: '<', gt: '>',
  le: '≤', leq: '≤', ge: '≥', geq: '≥',
  ll: '≪', gg: '≫', prec: '≺', succ: '≻',
  sim: '∼', simeq: '≃', approx: '≈', cong: '≅',
  equiv: '≡', propto: '∝', subset: '⊂', supset: '⊃',
  subseteq: '⊆', supseteq: '⊇', in: '∈', notin: '∉',
  ni: '∋', forall: '∀', exists: '∃', nexists: '∄',
  // Arrows
  to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
  Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔',
  mapsto: '↦', implies: '⟹', iff: '⟺',
  uparrow: '↑', downarrow: '↓', updownarrow: '↕',
  // Logic
  land: '∧', lor: '∨', lnot: '¬', neg: '¬',
  // Misc
  infty: '∞', nabla: '∇', partial: '∂',
  prime: '′', emptyset: '∅', varnothing: '∅',
  angle: '∠', triangle: '△', square: '□',
  ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
  Re: 'ℜ', Im: 'ℑ', wp: '℘', ell: 'ℓ',
  hbar: 'ℏ', aleph: 'ℵ',
};

const BIG_OPERATORS: Record<string, string> = {
  sum: '∑', prod: '∏', coprod: '∐',
  int: '∫', iint: '∬', iiint: '∭', oint: '∮',
  bigcup: '⋃', bigcap: '⋂', bigsqcup: '⨆',
  bigvee: '⋁', bigwedge: '⋀', bigoplus: '⨁',
  bigotimes: '⨂', bigodot: '⨀', biguplus: '⨄',
};

const FUNCTIONS: string[] = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan',
  'exp', 'log', 'ln', 'lg',
  'lim', 'limsup', 'liminf',
  'max', 'min', 'sup', 'inf',
  'arg', 'deg', 'det', 'dim', 'gcd', 'hom', 'ker',
  'Pr', 'mod', 'bmod',
];

const ACCENTS: Record<string, string> = {
  hat: '\u0302',      // Combining circumflex
  check: '\u030C',    // Combining caron
  tilde: '\u0303',    // Combining tilde
  acute: '\u0301',    // Combining acute
  grave: '\u0300',    // Combining grave
  dot: '\u0307',      // Combining dot above
  ddot: '\u0308',     // Combining diaeresis
  dddot: '\u20DB',    // Combining three dots above
  bar: '\u0304',      // Combining macron
  vec: '\u20D7',      // Combining right arrow above
  overline: '\u0305', // Combining overline
  widehat: '\u0302',
  widetilde: '\u0303',
};

const BRACKETS: Record<string, { char: string; type: 'open' | 'close' }> = {
  '(': { char: '(', type: 'open' },
  ')': { char: ')', type: 'close' },
  '[': { char: '[', type: 'open' },
  ']': { char: ']', type: 'close' },
  '\\{': { char: '{', type: 'open' },
  '\\}': { char: '}', type: 'close' },
  '\\lbrace': { char: '{', type: 'open' },
  '\\rbrace': { char: '}', type: 'close' },
  '\\langle': { char: '⟨', type: 'open' },
  '\\rangle': { char: '⟩', type: 'close' },
  '\\lfloor': { char: '⌊', type: 'open' },
  '\\rfloor': { char: '⌋', type: 'close' },
  '\\lceil': { char: '⌈', type: 'open' },
  '\\rceil': { char: '⌉', type: 'close' },
  '|': { char: '|', type: 'open' },
  '\\|': { char: '‖', type: 'open' },
  '\\vert': { char: '|', type: 'open' },
  '\\Vert': { char: '‖', type: 'open' },
  '.': { char: '', type: 'open' }, // invisible bracket
};

// ============================================================================
// LaTeX to MathML Parser
// ============================================================================

class LaTeXToMathML {
  private input: string;
  private pos: number = 0;

  constructor(latex: string) {
    this.input = latex.trim();
  }

  parse(): string {
    const content = this.parseTokens();
    return `<mrow>${content}</mrow>`;
  }

  private parseTokens(stopAt?: string): string {
    let result = '';
    let tokens: string[] = [];

    while (this.pos < this.input.length) {
      // Check for stop condition
      if (stopAt && this.input[this.pos] === stopAt) {
        break;
      }

      const token = this.parseNextToken();
      if (token === null) break;

      // Handle scripts by attaching to previous token
      if (token.startsWith('__SCRIPT_')) {
        const lastToken = tokens.pop() || '<mrow></mrow>';
        tokens.push(this.attachScript(lastToken, token));
      } else {
        tokens.push(token);
      }
    }

    result = tokens.join('');
    return result;
  }

  private parseNextToken(): string | null {
    this.skipWhitespace();
    if (this.pos >= this.input.length) return null;

    const char = this.input[this.pos];

    // Subscript or superscript
    if (char === '_' || char === '^') {
      return this.parseScript();
    }

    // Command
    if (char === '\\') {
      return this.parseCommand();
    }

    // Group
    if (char === '{') {
      return this.parseGroup();
    }

    // Number
    if (/\d/.test(char)) {
      return this.parseNumber();
    }

    // Operator characters
    if (/[+\-*/=<>!,;:]/.test(char)) {
      this.pos++;
      const op = char === '-' ? '−' : char;
      return `<mo>${op}</mo>`;
    }

    // Parentheses and brackets
    if (/[()[\]|]/.test(char)) {
      this.pos++;
      return `<mo>${char}</mo>`;
    }

    // Letter (identifier)
    if (/[a-zA-Z]/.test(char)) {
      this.pos++;
      return `<mi>${char}</mi>`;
    }

    // Skip unknown
    this.pos++;
    return '';
  }

  private parseScript(): string {
    const scriptType = this.input[this.pos];
    this.pos++;
    this.skipWhitespace();

    const arg = this.parseScriptArgument();

    // Check for combined sub+superscript
    this.skipWhitespace();
    if (this.pos < this.input.length) {
      const nextChar = this.input[this.pos];
      if ((scriptType === '_' && nextChar === '^') || (scriptType === '^' && nextChar === '_')) {
        this.pos++;
        this.skipWhitespace();
        const secondArg = this.parseScriptArgument();

        if (scriptType === '_') {
          return `__SCRIPT_SUBSUP__${arg}__SEP__${secondArg}`;
        } else {
          return `__SCRIPT_SUBSUP__${secondArg}__SEP__${arg}`;
        }
      }
    }

    return scriptType === '_' ? `__SCRIPT_SUB__${arg}` : `__SCRIPT_SUP__${arg}`;
  }

  private parseScriptArgument(): string {
    this.skipWhitespace();
    if (this.pos >= this.input.length) return '<mrow></mrow>';

    if (this.input[this.pos] === '{') {
      return this.parseGroup();
    }

    if (this.input[this.pos] === '\\') {
      return this.parseCommand();
    }

    const char = this.input[this.pos];
    this.pos++;

    if (/\d/.test(char)) {
      return `<mn>${char}</mn>`;
    }

    return `<mi>${char}</mi>`;
  }

  private attachScript(base: string, script: string): string {
    if (script.startsWith('__SCRIPT_SUBSUP__')) {
      const parts = script.replace('__SCRIPT_SUBSUP__', '').split('__SEP__');
      return `<msubsup>${base}<mrow>${parts[0]}</mrow><mrow>${parts[1]}</mrow></msubsup>`;
    } else if (script.startsWith('__SCRIPT_SUB__')) {
      const sub = script.replace('__SCRIPT_SUB__', '');
      return `<msub>${base}<mrow>${sub}</mrow></msub>`;
    } else if (script.startsWith('__SCRIPT_SUP__')) {
      const sup = script.replace('__SCRIPT_SUP__', '');
      return `<msup>${base}<mrow>${sup}</mrow></msup>`;
    }
    return base;
  }

  private parseCommand(): string {
    this.pos++; // skip backslash
    let command = '';

    // Read command name
    while (this.pos < this.input.length && /[a-zA-Z]/.test(this.input[this.pos])) {
      command += this.input[this.pos];
      this.pos++;
    }

    // Handle special single-character commands
    if (command === '' && this.pos < this.input.length) {
      const char = this.input[this.pos];
      this.pos++;
      if (char === '{') return '<mo>{</mo>';
      if (char === '}') return '<mo>}</mo>';
      if (char === '\\') return '<mspace width="1em"/>';
      if (char === ',') return '<mspace width="0.167em"/>';
      if (char === ';') return '<mspace width="0.278em"/>';
      if (char === '!') return '<mspace width="-0.167em"/>';
      if (char === ' ') return '<mspace width="0.25em"/>';
      return `<mo>${char}</mo>`;
    }

    return this.processCommand(command);
  }

  private processCommand(cmd: string): string {
    // Greek letters
    if (GREEK_LETTERS[cmd]) {
      return `<mi>${GREEK_LETTERS[cmd]}</mi>`;
    }

    // Operators
    if (OPERATORS[cmd]) {
      return `<mo>${OPERATORS[cmd]}</mo>`;
    }

    // Big operators
    if (BIG_OPERATORS[cmd]) {
      return `<mo stretchy="false">${BIG_OPERATORS[cmd]}</mo>`;
    }

    // Functions
    if (FUNCTIONS.includes(cmd)) {
      return `<mi mathvariant="normal">${cmd}</mi>`;
    }

    // Fractions
    if (cmd === 'frac' || cmd === 'dfrac' || cmd === 'tfrac') {
      this.skipWhitespace();
      const num = this.parseGroup();
      this.skipWhitespace();
      const den = this.parseGroup();
      return `<mfrac>${num}${den}</mfrac>`;
    }

    // Square root
    if (cmd === 'sqrt') {
      this.skipWhitespace();
      // Check for optional nth root
      if (this.input[this.pos] === '[') {
        this.pos++;
        let index = '';
        while (this.pos < this.input.length && this.input[this.pos] !== ']') {
          index += this.input[this.pos];
          this.pos++;
        }
        this.pos++; // skip ]
        this.skipWhitespace();
        const content = this.parseGroup();
        return `<mroot>${content}<mrow><mn>${index}</mn></mrow></mroot>`;
      }
      const content = this.parseGroup();
      return `<msqrt>${content}</msqrt>`;
    }

    // Text
    if (cmd === 'text' || cmd === 'textrm' || cmd === 'textit' || cmd === 'textbf') {
      this.skipWhitespace();
      const text = this.parseGroupRaw();
      return `<mtext>${text}</mtext>`;
    }

    // Math variants
    if (cmd === 'mathrm' || cmd === 'rm') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="normal">${content}</mi>`;
    }

    if (cmd === 'mathbf' || cmd === 'bf' || cmd === 'boldsymbol') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="bold">${content}</mi>`;
    }

    if (cmd === 'mathit' || cmd === 'it') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="italic">${content}</mi>`;
    }

    if (cmd === 'mathbb') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="double-struck">${content}</mi>`;
    }

    if (cmd === 'mathcal' || cmd === 'cal') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="script">${content}</mi>`;
    }

    if (cmd === 'mathfrak' || cmd === 'frak') {
      this.skipWhitespace();
      const content = this.parseGroupRaw();
      return `<mi mathvariant="fraktur">${content}</mi>`;
    }

    // Accents
    if (ACCENTS[cmd]) {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<mover accent="true">${content}<mo>${ACCENTS[cmd]}</mo></mover>`;
    }

    if (cmd === 'overline' || cmd === 'bar') {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<mover accent="true">${content}<mo>‾</mo></mover>`;
    }

    if (cmd === 'underline') {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<munder accentunder="true">${content}<mo>_</mo></munder>`;
    }

    if (cmd === 'overbrace') {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<mover>${content}<mo>⏞</mo></mover>`;
    }

    if (cmd === 'underbrace') {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<munder>${content}<mo>⏟</mo></munder>`;
    }

    // Binomial
    if (cmd === 'binom' || cmd === 'choose') {
      this.skipWhitespace();
      const n = this.parseGroup();
      this.skipWhitespace();
      const k = this.parseGroup();
      return `<mrow><mo>(</mo><mfrac linethickness="0">${n}${k}</mfrac><mo>)</mo></mrow>`;
    }

    // Left/Right brackets
    if (cmd === 'left') {
      this.skipWhitespace();
      const bracket = this.parseBracket();
      return `<mo fence="true" stretchy="true">${bracket}</mo>`;
    }

    if (cmd === 'right') {
      this.skipWhitespace();
      const bracket = this.parseBracket();
      return `<mo fence="true" stretchy="true">${bracket}</mo>`;
    }

    // Spacing
    if (cmd === 'quad') return '<mspace width="1em"/>';
    if (cmd === 'qquad') return '<mspace width="2em"/>';
    if (cmd === 'enspace') return '<mspace width="0.5em"/>';
    if (cmd === 'thinspace') return '<mspace width="0.167em"/>';

    // Over/under
    if (cmd === 'overset') {
      this.skipWhitespace();
      const over = this.parseGroup();
      this.skipWhitespace();
      const base = this.parseGroup();
      return `<mover>${base}${over}</mover>`;
    }

    if (cmd === 'underset') {
      this.skipWhitespace();
      const under = this.parseGroup();
      this.skipWhitespace();
      const base = this.parseGroup();
      return `<munder>${base}${under}</munder>`;
    }

    // Phantom (invisible but takes space)
    if (cmd === 'phantom') {
      this.skipWhitespace();
      const content = this.parseGroup();
      return `<mphantom>${content}</mphantom>`;
    }

    // Color (simplified - just renders content)
    if (cmd === 'color') {
      this.skipWhitespace();
      this.parseGroup(); // color name - ignore for now
      return '';
    }

    // Operators with limits
    if (cmd === 'limits') {
      return ''; // handled by parent
    }

    if (cmd === 'nolimits') {
      return ''; // handled by parent
    }

    // Not found - return as text
    return `<mi mathvariant="normal">${cmd}</mi>`;
  }

  private parseGroup(): string {
    this.skipWhitespace();
    if (this.pos >= this.input.length) return '<mrow></mrow>';

    if (this.input[this.pos] !== '{') {
      // Single token
      return this.parseNextToken() || '<mrow></mrow>';
    }

    this.pos++; // skip {
    const content = this.parseTokens('}');
    this.pos++; // skip }

    return `<mrow>${content}</mrow>`;
  }

  private parseGroupRaw(): string {
    this.skipWhitespace();
    if (this.pos >= this.input.length || this.input[this.pos] !== '{') {
      return '';
    }

    this.pos++; // skip {
    let content = '';
    let depth = 1;

    while (this.pos < this.input.length && depth > 0) {
      const char = this.input[this.pos];
      if (char === '{') depth++;
      else if (char === '}') depth--;

      if (depth > 0) content += char;
      this.pos++;
    }

    return content;
  }

  private parseBracket(): string {
    if (this.pos >= this.input.length) return '';

    // Check for backslash commands
    if (this.input[this.pos] === '\\') {
      this.pos++;
      let cmd = '';
      while (this.pos < this.input.length && /[a-zA-Z{|}]/.test(this.input[this.pos])) {
        cmd += this.input[this.pos];
        this.pos++;
        if (cmd === '{' || cmd === '}') break;
      }

      const key = '\\' + cmd;
      if (BRACKETS[key]) {
        return BRACKETS[key].char;
      }
      return cmd;
    }

    // Check for pipe
    if (this.input[this.pos] === '|') {
      this.pos++;
      return '|';
    }

    // Check for dot (invisible)
    if (this.input[this.pos] === '.') {
      this.pos++;
      return '';
    }

    // Regular bracket
    const char = this.input[this.pos];
    this.pos++;
    return char;
  }

  private parseNumber(): string {
    let num = '';
    while (this.pos < this.input.length && /[\d.]/.test(this.input[this.pos])) {
      num += this.input[this.pos];
      this.pos++;
    }
    return `<mn>${num}</mn>`;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }
}

// ============================================================================
// Convert Function
// ============================================================================

function latexToMathML(latex: string, display: 'inline' | 'block' = 'inline'): string {
  try {
    const parser = new LaTeXToMathML(latex);
    const mathContent = parser.parse();
    
    const displayAttr = display === 'block' ? 'block' : 'inline';
    
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="${displayAttr}">
      <semantics>
        ${mathContent}
        <annotation encoding="application/x-tex">${escapeHtml(latex)}</annotation>
      </semantics>
    </math>`;
  } catch (e) {
    console.error('MathML parsing error:', e);
    return `<code class="math-error">${escapeHtml(latex)}</code>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================================
// Component
// ============================================================================

const MathBlock: React.FC<MathBlockProps> = memo(({ content, display = 'inline', className = '' }) => {
  const mathML = useMemo(() => latexToMathML(content, display), [content, display]);

  const containerClass = display === 'block' 
    ? `litedown-math-block ${className}`.trim()
    : `litedown-math-inline ${className}`.trim();

  return (
    <span
      className={containerClass}
      dangerouslySetInnerHTML={{ __html: mathML }}
    />
  );
});

MathBlock.displayName = 'MathBlock';

// ============================================================================
// Exports
// ============================================================================

export { MathBlock, latexToMathML };
export type { MathBlockProps };