import {
  streamText,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  type ToolSet,
  wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai";
import { createFileRoute } from "@tanstack/react-router";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { models } from "ai/models";
import { createOllama } from "ai-sdk-ollama";
import { retrieveWebPageTool, webSearchTool } from "@/ai/tools/web-search";
import { groupInstructions } from "@/ai/prompt";
import { datetimeTool } from "@/ai/tools/datetime";
import { academicSearchTool } from "@/ai/tools/academic-search";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const {
          messages,
          model,
          webSearch,
          provider,
          doAcademicSearch,
        }: {
          messages: UIMessage[];
          model: string;
          webSearch: boolean;
          provider: string;
          doAcademicSearch: boolean;
        } = await request.json();

        // Provider Config
        const google = createGoogleGenerativeAI({
          apiKey: process.env.SOME_API_KEY,
        });

        const groq = createGroq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const ollama = createOllama({
          baseURL: "http://localhost:11434/",
        });

        const selectedModelInfo = models.find((item) => item.id === model);

        let llmModel;
        if (provider === "google") {
          llmModel = google(model);
        } else if (provider === "groq") {
          llmModel = groq(model);
        } else if (provider === "ollama") {
          llmModel = wrapLanguageModel({
            model: ollama(model),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          });
        } else {
          return new Response("Unsupported provider", { status: 400 });
        }

        let systemPrompt: string;
        systemPrompt = groupInstructions.chat;
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

        // Generate Response
        let result;
        if (selectedModelInfo && !selectedModelInfo.toolSupport) {
          result = streamText({
            model: llmModel,
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
          });
        } else {
          result = streamText({
            model: llmModel,
            system: systemPrompt,
            messages: await convertToModelMessages(messages),
            tools: tools,
            toolChoice: "auto",
            stopWhen: stepCountIs(3),
          });
        }

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
