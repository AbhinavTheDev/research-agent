const BASE_URL = `https://api.tavily.com/`;

/**
 * Common interface for web search providers.
 * Defines the contract for searching the web and returning results.
 */
export interface SearchProvider {
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


// Type for TavilyExtractResponse
interface TavilyExtractResponse {
  results: {
    url: string;
    raw_content: string;
    images?: string[];
    favicon?: string;
  }[];
  failed_results: string[];
  response_time: number;
  usage?: { credits: number };
  request_id?: string;
}

// Type for SearchResult (based on your existing code)
interface SearchResult {
  query: string;
  results: {
    url: string;
    title: string;
    content: string;
    score: number;
    raw_content?: string;
  }[];
  answer?: string;
  images?: string[];
  response_time: number;
}

export class TavilyProvider implements SearchProvider {
  private apiKey: string;
  private baseUrl = "https://api.tavily.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        max_results: options?.maxResults ?? 5,
        search_depth: options?.searchDepth ?? "basic",
        topic: options?.topic ?? "general",
      }),
    });
    return response.json();
  }

  async extract(urls: string[]): Promise<TavilyExtractResponse> {
    const response = await fetch(`${this.baseUrl}/extract`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    });
    return response.json();
  }
}