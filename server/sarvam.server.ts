// src/server/sarvam.server.ts

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

// ============== Types ==============

export interface SarvamMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SarvamChatParams {
  messages: SarvamMessage[];
  model?: "sarvam-m";
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: "low" | "medium" | "high";
  wiki_grounding?: boolean;
}

export interface SarvamConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class SarvamError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "SarvamError";
  }
}

// ============== Helpers ==============

function getApiKey(explicit?: string): string {
  const key = explicit ?? process.env.SARVAM_API_KEY;
  if (!key) throw new SarvamError(401, "SARVAM_API_KEY required");
  return key;
}

export function toSarvamMessages(messages: UIMessage[]): SarvamMessage[] {
  return messages
    .filter((m) => ['user', 'assistant', 'system'].includes(m.role))
    .map((m) => ({
      role: m.role as SarvamMessage['role'],
      content: extractContent(m),
    }))
    .filter((m) => m.content.length > 0);
}

function extractContent(message: UIMessage): string {
  // Handle parts array (new UIMessage format)
  if ('parts' in message && Array.isArray(message.parts)) {
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => 
        p.type === 'text' && typeof p.text === 'string'
      )
      .map((p) => p.text)
      .join('\n');
  }

  // Handle legacy content string
  if ('content' in message) {
    const content = message.content;
    if (typeof content === 'string') return content;
    
    if (Array.isArray(content)) {
      return content
        .filter((p): p is { type: 'text'; text: string } =>
          typeof p === 'object' && p?.type === 'text' && typeof p?.text === 'string'
        )
        .map((p) => p.text)
        .join('\n');
    }
  }

  return '';
}

export function withSystemPrompt(
  prompt: string,
  messages: SarvamMessage[],
): SarvamMessage[] {
  const filtered = messages.filter((m) => m.role !== "system");
  return [{ role: "system", content: prompt }, ...filtered];
}

// ============== Stream Implementation ==============

/**
 * Creates AI SDK compatible streaming response using official createUIMessageStream
 */
export async function streamSarvamChat(
  params: SarvamChatParams,
  config?: SarvamConfig,
  originalMessages?: UIMessage[],
): Promise<Response> {
  const apiKey = getApiKey(config?.apiKey);
  const baseUrl = config?.baseUrl ?? "https://api.sarvam.ai";

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      originalMessages,

      async execute({ writer }) {
        // Fetch from Sarvam API
        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
          },
          body: JSON.stringify({
            model: params.model ?? "sarvam-m",
            ...params,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new SarvamError(
            res.status,
            errorText || `Error: ${res.status}`,
          );
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Generate a unique ID for the text block
        const textId = `text-${Date.now()}`;
        let textStarted = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") {
                // End text block if started
                if (textStarted) {
                  writer.write({
                    type: "text-end",
                    id: textId,
                  });
                }
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  // Start text block on first content
                  if (!textStarted) {
                    writer.write({
                      type: "text-start",
                      id: textId,
                    });
                    textStarted = true;
                  }

                  // Write text delta
                  writer.write({
                    type: "text-delta",
                    id: textId,
                    delta: content,
                  });
                }

                // Check for finish reason
                const finishReason = parsed.choices?.[0]?.finish_reason;
                if (finishReason) {
                  if (textStarted) {
                    writer.write({
                      type: "text-end",
                      id: textId,
                    });
                  }
                  return;
                }
              } catch (e) {
                console.error("[Sarvam Parse Error]", e);
              }
            }
          }

          // End text block if we exit loop
          if (textStarted) {
            writer.write({
              type: "text-end",
              id: textId,
            });
          }
        } catch (error) {
          // End text block on error
          if (textStarted) {
            writer.write({
              type: "text-end",
              id: textId,
            });
          }
          throw error;
        } finally {
          reader.releaseLock();
        }
      },

      onError(error) {
        console.error("[Sarvam Stream Error]", error);
        if (error instanceof SarvamError) {
          return error.message;
        }
        return error instanceof Error
          ? error.message
          : "Unknown error occurred";
      },
      
      onFinish({ responseMessage, finishReason }) {
        console.log("[Sarvam] Stream finished", {
          messageId: responseMessage?.id,
          finishReason,
        });
      },
    }),

    headers: {
      "Cache-Control": "no-cache",
    },
  });
}

// ============== Non-streaming version ==============

export async function sarvamChat(
  params: SarvamChatParams,
  config?: SarvamConfig,
): Promise<{
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}> {
  const apiKey = getApiKey(config?.apiKey);
  const baseUrl = config?.baseUrl ?? "https://api.sarvam.ai";

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify({
      model: params.model ?? "sarvam-m",
      ...params,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new SarvamError(res.status, await res.text());
  }

  const data = await res.json();
  return {
    content: data.choices?.[0]?.message?.content ?? "",
    usage: data.usage,
  };
}
