import { TavilyProvider, type SearchProvider } from "@/server/tavily.server";
import { createServerOnlyFn } from "@tanstack/react-start";
import { tool } from "ai";
import { z } from "zod/v4";

/**
 * Creates and returns a SearchProvider instance based on the specified provider.
 * Currently supports only "tavily" as the provider.
 * @param provider - The name of the search provider (e.g., "tavily").
 * @param apiKey - The API key for the specified provider.
 * @returns An instance of the SearchProvider.
 * @throws Error if an unknown provider is specified.
 */
// function createSearchTool(provider: "tavily", apiKey: string): SearchProvider {
//   switch (provider) {
//     case "tavily":
//       return new TavilyProvider(apiKey);
//     default:
//       throw new Error(`Unknown provider: ${provider}`);
//   }
// }

const createSearchTool = createServerOnlyFn((provider: "tavily", apiKey: string): SearchProvider => {
  switch (provider) {
    case "tavily":
      return new TavilyProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
});

/**
 * Tavily API Key Getter - Server Only Function
 */
const getTavilyApiKey = createServerOnlyFn(() => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY API KEY is not available!!!");
  }
  return apiKey;
});

/**
 * An AI SDK tool for performing web searches.
 * This tool allows querying the web and retrieving structured results.
 */
export const webSearchTool = tool({
  description:
    "Search the web for real-time information using Tavily's AI-optimized search engine. Returns relevant sources, snippets, and optional AI-generated answers.",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    maxResults: z.number().optional().default(5),
  }),
  execute: async ({ query, maxResults }) => {
    // Lazy retrieval: Only check/get API key when tool is executed
    const apiKey = getTavilyApiKey();
    const provider = createSearchTool("tavily", apiKey);
    try {
      return await provider.search(query, { maxResults });
    } catch (error) {
      console.error("Web Search Error:", error);
      throw error;
    }
  },
});

export const retrieveWebPageTool = tool({
  description:
    "Extract clean, structured content from one or more URLs. Returns parsed content in markdown or text format, optimized for AI consumption.",
  inputSchema: z.object({
    urls: z.array(z.url()).describe("URLs to extract content"),
  }),
  execute: async ({ urls }) => {
    const apiKey = getTavilyApiKey();
    const provider = createSearchTool("tavily", apiKey);
    try {
      return await provider.extract(urls);
    } catch (error) {
      console.error("Retrieve Web Page Error:", error);
      throw error;
    }
  },
});
