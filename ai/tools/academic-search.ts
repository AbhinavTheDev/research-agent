/*
High-Level Flow Diagram

Intent Analysis (LLM): The user prompt (e.g., "Find me recent papers on solid-state batteries") is parsed by the AI SDK into structured filters (year, concepts, keywords).

The Orchestrator: Manages the three-stage "Fetch -> Enrich -> Merge" cycle.

The Polite Fetcher: Communicates with OpenAlex using your API key and respects the 100k credit limit and the 100/sec burst limit.

Enrichment Workers: Parallel processes that reconstruct abstracts and query Unpaywall for PDF locations.

Context Synthesis: The LLM receives the "rich" data to generate the final response.
*/


import { createServerOnlyFn } from "@tanstack/react-start";
import { tool } from "ai";
import { z } from "zod";

interface OpenAlexWork {
  id: string;
  doi?: string;
  title: string;
  abstract_inverted_index?: Record<string, number[]>;
  publication_year?: number;
  publication_date?: Date;
  authorships?: any[]; 
  cited_by_count?: number;
  open_access?: { is_oa: boolean };
  primary_location?: any;
  keywords?: string[];
  primary_topic?: any;
}

interface EnrichedWork extends OpenAlexWork {
  abstract: string;
  pdfUrl?: string;
}

const getOpenAlexApiKey = createServerOnlyFn(() => {
  const apiKey = process.env.OPENALEX_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAlex API KEY is not available!!!");
  }
  return apiKey;
});

const getUnpaywallEmail = createServerOnlyFn(() => {
  const email = process.env.UNPAYWALL_EMAIL_ID;
  if (!email) {
    throw new Error("Unpaywall email id is not available!!!");
  }
  return email;
});

// Correct API Format
// https://api.openalex.org/works?search=current%20research%20in%20physics&filter=has_abstract:true,from_publication_date:2023-01-01,is_oa:true&per_page=20

async function fetchOpenAlex(
  query: string,
  filter: string,
): Promise<OpenAlexWork[] | undefined> {
  try {
    const selectFields =
      "id,title,publication_year,publication_date,abstract_inverted_index,doi,primary_location,open_access,cited_by_count,authorships,keywords,primary_topic";

    const res = await fetch(
      `https://api.openalex.org/works?search=${query}&filter=${filter}&select=${selectFields}&per_page=20`,
    );

    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);
    const data = await res.json();
    
    return data?.results || [];
  } catch (error) {
    console.error("Error fetching from OpenAlex:", error);
    return [];
  }
}

async function fetchUnpaywall(doi: string, email: string) {
  try {
    const res = await fetch(
      `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${email}`,
    );
    if (res.ok) {
      const unpaywallData = await res.json();
      return unpaywallData;
    }
  } catch (error) {
    console.error(`Error querying Unpaywall for DOI ${doi}:`, error);
    return {};
  }
}

async function enrichWork(
  work: OpenAlexWork,
  email: string,
): Promise<EnrichedWork> {
  // Reconstruct abstract (keep as-is)
  const abstract = reconstructAbstract(work.abstract_inverted_index);

  // Query Unpaywall for PDF (keep as-is)
  let pdfUrl: string | undefined;
  if (work.doi) {
    const res = await fetchUnpaywall(work.doi, email);
    pdfUrl = res?.best_oa_location?.url;
  }

  // Filter and simplify the work object for efficiency
  const filteredWork: Partial<OpenAlexWork> = {
    id: work.id,
    doi: work.doi,
    title: work.title,
    publication_year: work.publication_year,
    publication_date: work.publication_date,
    cited_by_count: work.cited_by_count,
    open_access: work.open_access, // Keep nested for is_oa status
    primary_location: work.primary_location, // Keep for landing_page_url
    authorships:
      work.authorships?.map((auth) => ({
        author: auth.author?.display_name || "Unknown", // Simplify to just author names
      })) || [],
    keywords: work.keywords?.slice(0, 5) || [], // Limit to top 5 keywords
    primary_topic: work.primary_topic, // Keep for display_name
  };

  return {
    ...filteredWork,
    abstract,
    pdfUrl,
  } as EnrichedWork;
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return "";

  const entries = Object.entries(invertedIndex);
  // Find the maximum index to determine the array size
  const maxIndex = Math.max(...entries.flatMap(([_, pos]) => pos));
  const result = new Array(maxIndex + 1);

  for (const [word, positions] of entries) {
    for (const pos of positions) {
      result[pos] = word;
    }
  }

  return result.join(" ");
}

/**
 * Searches for academic papers using the OpenAlex API, with optional filtering by publication date and open access status.
 *
 * This tool performs a search based on the provided query keywords, applies filters for publication date and open access,
 * fetches results from OpenAlex, and enriches them with reconstructed abstracts and open access links via Unpaywall.
 *
 * @param query - The search keywords to query academic papers.
 * @param publishedAfter - Optional ISO date string (e.g., "2024-01-01") to filter papers published after this date.
 * @param isOA - Optional boolean to filter for open access papers only; defaults to true.
 *
 * @returns A promise that resolves to an array of enriched academic paper objects, each containing metadata,
 *          reconstructed abstracts, and open access URLs. Returns an empty array if no results are found or on fetch errors.
 *
 * @example
 * ```typescript
 * const results = await academicSearchTool.execute({
 *   query: "machine learning",
 *   publishedAfter: "2023-01-01",
 *   isOA: true
 * });
 * console.log(results); // Array of enriched paper objects
 * ```
 */
export const academicSearchTool = tool({
  description:
    "Searches for academic papers using the OpenAlex API. Filters by publication date and open access status, then enriches results with abstracts and PDF URLs from Unpaywall. Returns an array of papers with their abstracts, metadata, and PDF URLs.",
  inputSchema: z.object({
    query: z.string().describe("The search keywords"),
    publishedAfter: z
      .string()
      .optional()
      .describe("ISO date string (e.g. 2024-01-01)"),
    isOA: z.boolean().default(true).describe("Filter for open access only"),
  }),
  execute: async ({ query, publishedAfter, isOA }) => {
    // 1. Check Redis Cache first
    // const cacheKey = `search:${query}:${publishedAfter}:${isOA}`;
    // const cached = await redis.get(cacheKey);
    // if (cached) return JSON.parse(cached);

    // 2. Build OpenAlex Filter String
    let filter = `has_abstract:true`;
    if (publishedAfter) filter += `,from_publication_date:${publishedAfter}`;
    if (isOA) filter += `,is_oa:true`;

    console.log("Query: ", query);
    console.log("Filter: ", filter);

    // 3. Fetch from OpenAlex
    const results = await fetchOpenAlex(query, filter);
    if (!results) return []; // Handle fetch errors
   
    // 4. Enrich results (Abstract Reconstruction + Unpaywall)
    const unpaywallEmail = getUnpaywallEmail();
    const enrichedResults = await Promise.all(
      results.map((work: OpenAlexWork) => enrichWork(work, unpaywallEmail)),
    );

    // await redis.set(cacheKey, JSON.stringify(enrichedResults), "EX", 86400);
    return enrichedResults;
  },
});
