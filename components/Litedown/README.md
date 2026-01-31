# LiteDown - Lightweight Markdown Renderer

A highly lightweight alternative to heavy markdown rendering libraries with built-in streaming support.

## Features

- ⚡ **Lightweight**: ~30KB total vs 550KB+ for alternatives
- 🌊 **Streaming Support**: Built-in support for real-time content streaming
- 🎨 **Syntax Highlighting**: Prism.js with 20+ languages
- 📐 **Math Rendering**: Lightweight math notation support
- 📊 **Tables**: Beautiful table rendering with alignment
- 🔧 **Modular**: Use only what you need

## Installation

The component is already set up in this project. Just import and use:

```tsx
import { LiteDown } from './components/LiteDown';
```

## Basic Usage

```tsx
import { LiteDown } from './components/LiteDown';

function MyComponent() {
  return (
    <LiteDown
      content="# Hello World\n\nThis is **markdown**!"
      config={{
        theme: 'light',
        lineNumbers: true,
        copyButton: true,
      }}
    />
  );
}
```

## Streaming Usage

### Simulated Streaming (for demos)

```tsx
import { StreamingLiteDown, useStreamingContent } from './components/LiteDown';

function StreamDemo() {
  const {
    content,
    isStreaming,
    start,
    pause,
    resume,
    reset,
    complete,
  } = useStreamingContent(fullMarkdownContent, {
    chunkSize: 5,
    delayMs: 30,
    naturalMode: true, // Varies speed for natural feel
  });

  return (
    <div>
      <button onClick={start}>Start</button>
      <StreamingLiteDown
        content={content}
        isStreaming={isStreaming}
        showCursor={true}
        debounceMs={50}
      />
    </div>
  );
}
```

### Real API Streaming (OpenAI, Claude, etc.)

```tsx
import { StreamingLiteDown, useAsyncStream } from './components/LiteDown';

function AIChat() {
  const {
    content,
    isStreaming,
    error,
    appendContent,
    startManualStream,
    endStream,
    reset,
  } = useAsyncStream();

  const sendMessage = async (message: string) => {
    reset();
    startManualStream();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Parse your API's format (e.g., SSE, JSON lines)
        appendContent(chunk);
      }
    } finally {
      endStream();
    }
  };

  return (
    <div>
      <button onClick={() => sendMessage('Hello!')}>Send</button>
      {error && <div className="error">{error.message}</div>}
      <StreamingLiteDown
        content={content}
        isStreaming={isStreaming}
        showCursor={true}
      />
    </div>
  );
}
```

### With OpenAI SDK

```tsx
import OpenAI from 'openai';
import { StreamingLiteDown, useAsyncStream } from './components/LiteDown';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function ChatWithGPT() {
  const { content, isStreaming, appendContent, startManualStream, endStream } = useAsyncStream();

  const chat = async (userMessage: string) => {
    startManualStream();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: userMessage }],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      appendContent(text);
    }

    endStream();
  };

  return (
    <StreamingLiteDown content={content} isStreaming={isStreaming} />
  );
}
```

### With Anthropic SDK

```tsx
import Anthropic from '@anthropic-ai/sdk';
import { StreamingLiteDown, useAsyncStream } from './components/LiteDown';

const anthropic = new Anthropic();

function ChatWithClaude() {
  const { content, isStreaming, appendContent, startManualStream, endStream } = useAsyncStream();

  const chat = async (userMessage: string) => {
    startManualStream();

    const stream = await anthropic.messages.stream({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        appendContent(event.delta.text);
      }
    }

    endStream();
  };

  return (
    <StreamingLiteDown content={content} isStreaming={isStreaming} />
  );
}
```

## Component API

### LiteDown

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Markdown content to render |
| `config.theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `config.lineNumbers` | `boolean` | `true` | Show line numbers in code |
| `config.copyButton` | `boolean` | `true` | Show copy button on code blocks |
| `config.className` | `string` | - | Additional CSS classes |

### StreamingLiteDown

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Current streamed content |
| `isStreaming` | `boolean` | `false` | Whether stream is active |
| `config` | `LiteDownConfig` | `{}` | Same as LiteDown config |
| `debounceMs` | `number` | `50` | Debounce delay for rendering |
| `showCursor` | `boolean` | `true` | Show cursor while streaming |
| `cursorElement` | `ReactNode` | - | Custom cursor component |
| `onStreamComplete` | `() => void` | - | Callback when streaming ends |

## Hooks API

### useStreamingContent

Simulates streaming for demos and testing.

```tsx
const {
  content,      // Current content
  isStreaming,  // Is stream active
  isComplete,   // Has stream finished
  start,        // Start streaming
  pause,        // Pause streaming
  resume,       // Resume streaming
  reset,        // Reset to beginning
  complete,     // Jump to end
  progress,     // Progress percentage
} = useStreamingContent(fullContent, options);
```

### useAsyncStream

Handles real async streaming from APIs.

```tsx
const {
  content,           // Accumulated content
  isStreaming,       // Is stream active
  error,             // Any error that occurred
  startStream,       // Start with ReadableStream or AsyncIterable
  appendContent,     // Manually append content
  startManualStream, // Start manual streaming mode
  endStream,         // End manual streaming
  abort,             // Abort current stream
  reset,             // Reset state
} = useAsyncStream();
```

## Standalone Components

You can also use individual components:

```tsx
import { CodeBlock, MathBlock, Diagram } from './components/LiteDown';

// Code with syntax highlighting
<CodeBlock 
  code="const x = 1;" 
  language="javascript"
  showLineNumbers={true}
  showCopyButton={true}
/>

// Math expressions
<MathBlock expression="E = mc^2" inline />
<MathBlock expression="\int_0^\infty e^{-x} dx = 1" />

// Simple diagrams
<Diagram content="[A] --> [B] --> [C]" />
```

## Bundle Size

| Feature | LiteDown | Alternatives |
|---------|----------|--------------|
| Syntax Highlighting | ~15KB (Prism) | ~200KB (Shiki) |
| Math Rendering | ~5KB (custom) | ~300KB (KaTeX) |
| Markdown Parser | ~10KB (marked) | ~50KB (remark) |
| **Total** | **~30KB** | **~550KB+** |

## Supported Languages

JavaScript, TypeScript, Python, Rust, Go, Java, C, C++, CSS, HTML, JSON, Bash, SQL, YAML, Markdown, JSX, TSX, and more.

## License

MIT