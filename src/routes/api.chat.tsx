// src/routes/api/chat.ts

import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  type ToolSet,
  createUIMessageStreamResponse,
} from "ai";
import { createFileRoute } from "@tanstack/react-router";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
// import { createGroq } from '@ai-sdk/groq';
import {
  streamSarvamChat,
  toSarvamMessages,
  withSystemPrompt,
  SarvamError,
} from "@/server/sarvam.server";
import {
  retrieveWebPageTool,
  webSearchTool,
} from "@/ai/tools/web-search.functions";
import { groupInstructions } from "@/ai/prompt";
import { datetimeTool } from "@/ai/tools/datetime";
import { academicSearchTool } from "@/ai/tools/academic-search";
import { createAiGateway } from "ai-gateway-provider";
import { createGroq } from "ai-gateway-provider/providers/groq";
import { createGoogleGenerativeAI } from "ai-gateway-provider/providers/google";
import { createCerebras } from "ai-gateway-provider/providers/cerebras";
import { createWorkersAI } from "workers-ai-provider";

// ============== Provider Instances ==============

// const google = createGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY,
// });

// const groq = createGroq({
//   apiKey: process.env.GROQ_API_KEY,
// });

const google = createGoogleGenerativeAI();

const groq = createGroq();

const cerebras = createCerebras();

const workersai = createWorkersAI({
  accountId: process.env.CF_ACCOUNT_ID,
  gateway: {
    id: process.env.CF_GATEWAY,
    apiKey: process.env.CF_API_KEY,
  },
  apiKey: process.env.CF_WORKER_API_KEY,
});

const aigateway = createAiGateway({
  accountId: process.env.CF_ACCOUNT_ID,
  gateway: process.env.CF_GATEWAY,
  apiKey: process.env.CF_API_KEY,
});

// ============== Types ==============

interface ChatRequestBody {
  messages: UIMessage[];
  model: string;
  provider: string;
  webSearch?: boolean;
  doAcademicSearch?: boolean;
}

// ============== Route ==============

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const {
            messages,
            model,
            webSearch,
            provider,
            doAcademicSearch,
          }: ChatRequestBody = await request.json();

          if (!messages?.length) {
            return errorResponse(400, "Messages required");
          }

          // Handle Sarvam
          if (provider === "sarvam") {
            return handleSarvam(messages, { webSearch, doAcademicSearch });
          }

          // Handle AI SDK providers
          return handleAISDKProvider({
            messages,
            model,
            provider,
            webSearch,
            doAcademicSearch,
          });
        } catch (error) {
          console.error("[Chat API Error]", error);

          if (error instanceof SarvamError) {
            return errorResponse(error.status, error.message);
          }

          const message =
            error instanceof Error ? error.message : "Internal server error";
          return errorResponse(500, message);
        }
      },
    },
  },
});

// ============== Handlers ==============

async function handleSarvam(
  messages: UIMessage[],
  options?: { webSearch?: boolean; doAcademicSearch?: boolean },
): Promise<Response> {
  if (options?.webSearch || options?.doAcademicSearch) {
    console.warn(
      "[Sarvam] Tools not supported, ignoring webSearch/academicSearch",
    );
  }

  const sarvamMessages = toSarvamMessages(messages);

  if (sarvamMessages.length === 0) {
    return errorResponse(400, "No valid messages");
  }

  const messagesWithSystem = withSystemPrompt(
    groupInstructions.chat,
    sarvamMessages,
  );

  // Pass original messages for message ID generation
  return streamSarvamChat(
    {
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 4096,
    },
    undefined, // config (uses env vars)
    messages, // originalMessages
  );
}

// async function handleWorkersAI(
//   messages: UIMessage[],
//   model: string,
//   webSearch?: boolean,
//   doAcademicSearch?: boolean,
// ): Promise<Response> {
//   const workersMessages = toWorkersAIMessages(messages);

//   if (workersMessages.length === 0) {
//     return errorResponse(400, "No valid messages");
//   }

//   let systemPrompt = groupInstructions.chat;
//   const tools: ToolSet = {};

//   if (webSearch) {
//     systemPrompt = groupInstructions.web;
//     tools.web_search = webSearchTool;
//     tools.retrieve_web_page = retrieveWebPageTool;
//   }

//   if (doAcademicSearch) {
//     systemPrompt = groupInstructions.acad;
//     tools.academic_search = academicSearchTool;
//   }

//   const messagesWithSystem = withWorkerSystemPrompt(
//     systemPrompt,
//     workersMessages,
//   );

//   // Pass original messages for message ID generation
//   return streamWorkersAIChat(
//     {
//       model: model,
//       messages: messagesWithSystem,
//       temperature: 0.7,
//       max_tokens: 4096,
//       sdkTools: tools,
//     }, // params
//     undefined, // config
//     messages, // msgs
//   );
// }

async function handleAISDKProvider({
  messages,
  model,
  provider,
  webSearch,
  doAcademicSearch,
}: ChatRequestBody): Promise<Response> {
  const llmModel = getModel(provider, model);
  if (!llmModel) {
    return errorResponse(400, `Unsupported provider: ${provider}`);
  }

  let systemPrompt = groupInstructions.chat;
  const tools: ToolSet = { dateTime: datetimeTool };

  if (webSearch) {
    systemPrompt = groupInstructions.web;
    tools.web_search = webSearchTool;
    tools.retrieve_web_page = retrieveWebPageTool;
  }

  if (doAcademicSearch) {
    systemPrompt = groupInstructions.acad;
    tools.academic_search = academicSearchTool;
  }

  const result = streamText({
    model: llmModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    toolChoice: "auto",
    stopWhen: stepCountIs(3),
  });

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}

// ============== Helpers ==============

function getModel(provider: string, model: string) {
  switch (provider) {
    case "google":
      return aigateway(google(model));
    case "groq":
      return aigateway(groq(model));
    // case "cerebras":
    //   return aigateway(cerebras(model));
    case "worker":
      return workersai(model);
    default:
      return null;
  }
}

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
