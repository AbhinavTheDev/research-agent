import { createServerOnlyFn } from "@tanstack/react-start";
import { tavily, type TavilyExtractResponse } from "@tavily/core";
import { tool } from "ai";
import { z } from "zod/v4";

/**
 * Common interface for web search providers.
 * Defines the contract for searching the web and returning results.
 */
interface SearchProvider {
  /**
   * Performs a web search with the given query and optional parameters.
   * @param query - The search query string.
   * @param options - Optional search configuration.
   * @returns A promise that resolves to the search results.
   */
  search(query: string, options?: SearchOptions): Promise<SearchResult>;
  extract(urls: string[]): Promise<TavilyExtractResponse>;
}

/**
 * Options for configuring a web search.
 */
interface SearchOptions {
  /**
   * The maximum number of results to return. Defaults to 5 if not specified.
   */
  maxResults?: number;
  /**
   * The depth of the search: "basic" for quick results or "advanced" for deeper analysis.
   */
  searchDepth?: "basic" | "advanced";
  /**
   * The topic category for the search: "general", "news", or "finance".
   */
  topic?: "general" | "news" | "finance";
}

/**
 * The result of a web search operation.
 */
interface SearchResult {
  /**
   * An array of search result items, each containing title, URL, and content.
   */
  results: { title: string; url: string; content: string }[];
  /**
   * An optional direct answer or summary from the search provider.
   */
  answer?: string;
}

/**
 * Implementation of the SearchProvider interface using the Tavily API.
 * Handles web searches via the Tavily client.
 */
class TavilyProvider implements SearchProvider {
  /**
   * The Tavily API client instance.
   */
  private client;

  /**
   * Creates a new TavilyProvider instance.
   * @param apiKey - The API key for authenticating with Tavily.
   */
  constructor(apiKey: string) {
    this.client = tavily({ apiKey });
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    return await this.client.search(query, {
      maxResults: options?.maxResults ?? 5,
      searchDepth: options?.searchDepth ?? "basic",
      topic: options?.topic ?? "general",
    });
  }

  async extract(urls: string[]): Promise<TavilyExtractResponse> {
    return await this.client.extract(urls);
  }
}

/**
 * Creates and returns a SearchProvider instance based on the specified provider.
 * Currently supports only "tavily" as the provider.
 * @param provider - The name of the search provider (e.g., "tavily").
 * @param apiKey - The API key for the specified provider.
 * @returns An instance of the SearchProvider.
 * @throws Error if an unknown provider is specified.
 */
function createSearchTool(provider: "tavily", apiKey: string): SearchProvider {
  switch (provider) {
    case "tavily":
      return new TavilyProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

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
