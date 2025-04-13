import os
import asyncio
import requests
import random 
import concurrent
import aiohttp
import time
import logging
from typing import List, Optional, Dict, Any, Union, Callable, TypeVar
from urllib.parse import unquote
from functools import wraps

from exa_py import Exa
# from linkup import LinkupClient  # Commented out
from tavily import AsyncTavilyClient
from duckduckgo_search import DDGS 
from bs4 import BeautifulSoup

from langchain_community.retrievers import ArxivRetriever
from langchain_community.utilities.pubmed import PubMedAPIWrapper
from langsmith import traceable

from state import Section
from langchain.chat_models import init_chat_model
from langchain_core.language_models import BaseChatModel

T = TypeVar('T')

def retry_with_exponential_backoff(
    max_retries: int = 5,
    base_delay: float = 1.0,
    jitter: float = 0.1,
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """Retry a function with exponential backoff when it raises specific exceptions."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            retries = 0
            while True:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    # Check if it's a rate limit error from DuckDuckGo
                    if "Ratelimit" in str(e) and retries < max_retries:
                        retries += 1
                        # Calculate delay with jitter
                        delay = base_delay * (2 ** retries) + random.uniform(0, jitter)
                        print(f"Search rate-limited. Retrying in {delay:.2f} seconds (attempt {retries}/{max_retries})...")
                        time.sleep(delay)
                    else:
                        # If max retries exceeded or different error, re-raise
                        raise
        return wrapper
    return decorator

def get_config_value(value):
    """
    Helper function to handle both string and enum cases of configuration values
    """
    return value if isinstance(value, str) else value.value

def get_search_params(search_api: str, search_api_config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Filters the search_api_config dictionary to include only parameters accepted by the specified search API.

    Args:
        search_api (str): The search API identifier (e.g., "exa", "tavily").
        search_api_config (Optional[Dict[str, Any]]): The configuration dictionary for the search API.

    Returns:
        Dict[str, Any]: A dictionary of parameters to pass to the search function.
    """
    # Define accepted parameters for each search API
    SEARCH_API_PARAMS = {
        "exa": ["max_characters", "num_results", "include_domains", "exclude_domains", "subpages"],
        "tavily": [],  # Tavily currently accepts no additional parameters
        "perplexity": [],  # Perplexity accepts no additional parameters
        "arxiv": ["load_max_docs", "get_full_documents", "load_all_available_meta"],
        "pubmed": ["top_k_results", "email", "api_key", "doc_content_chars_max"],
        "linkup": ["depth"],
    }

    # Get the list of accepted parameters for the given search API
    accepted_params = SEARCH_API_PARAMS.get(search_api, [])

    # If no config provided, return an empty dict
    if not search_api_config:
        return {}

    # Filter the config to only include accepted parameters
    return {k: v for k, v in search_api_config.items() if k in accepted_params}

def deduplicate_and_format_sources(search_response, max_tokens_per_source, include_raw_content=True):
    """
    Takes a list of search responses and formats them into a readable string.
    Limits the raw_content to approximately max_tokens_per_source tokens.
 
    Args:
        search_responses: List of search response dicts, each containing:
            - query: str
            - results: List of dicts with fields:
                - title: str
                - url: str
                - content: str
                - score: float
                - raw_content: str|None
        max_tokens_per_source: int
        include_raw_content: bool
            
    Returns:
        str: Formatted string with deduplicated sources
    """
     # Collect all results
    sources_list = []
    for response in search_response:
        sources_list.extend(response['results'])
    
    # Deduplicate by URL
    unique_sources = {source['url']: source for source in sources_list}

    # Format output
    formatted_text = "Content from sources:\n"
    for i, source in enumerate(unique_sources.values(), 1):
        formatted_text += f"{'='*80}\n"  # Clear section separator
        formatted_text += f"Source: {source['title']}\n"
        formatted_text += f"{'-'*80}\n"  # Subsection separator
        formatted_text += f"URL: {source['url']}\n===\n"
        formatted_text += f"Most relevant content from source: {source['content']}\n===\n"
        if include_raw_content:
            # Using rough estimate of 4 characters per token
            char_limit = max_tokens_per_source * 4
            # Handle None raw_content
            raw_content = source.get('raw_content', '')
            if raw_content is None:
                raw_content = ''
                print(f"Warning: No raw_content found for source {source['url']}")
            if len(raw_content) > char_limit:
                raw_content = raw_content[:char_limit] + "... [truncated]"
            formatted_text += f"Full source content limited to {max_tokens_per_source} tokens: {raw_content}\n\n"
        formatted_text += f"{'='*80}\n\n" # End section separator
                
    return formatted_text.strip()

def format_sections(sections: list[Section]) -> str:
    """ Format a list of sections into a string """
    formatted_str = ""
    for idx, section in enumerate(sections, 1):
        formatted_str += f"""
{'='*60}
Section {idx}: {section.name}
{'='*60}
Description:
{section.description}
Requires Research: 
{section.research}

Content:
{section.content if section.content else '[Not yet written]'}

"""
    return formatted_str

@traceable
async def tavily_search_async(search_queries):
    """
    Performs concurrent web searches using the Tavily API.

    Args:
        search_queries (List[SearchQuery]): List of search queries to process

    Returns:
            List[dict]: List of search responses from Tavily API, one per query. Each response has format:
                {
                    'query': str, # The original search query
                    'follow_up_questions': None,      
                    'answer': None,
                    'images': list,
                    'results': [                     # List of search results
                        {
                            'title': str,            # Title of the webpage
                            'url': str,              # URL of the result
                            'content': str,          # Summary/snippet of content
                            'score': float,          # Relevance score
                            'raw_content': str|None  # Full page content if available
                        },
                        ...
                    ]
                }
    """
    tavily_async_client = AsyncTavilyClient()
    search_tasks = []
    for query in search_queries:
            search_tasks.append(
                tavily_async_client.search(
                    query,
                    max_results=5,
                    include_raw_content=True,
                    topic="general"
                )
            )

    # Execute all searches concurrently
    search_docs = await asyncio.gather(*search_tasks)

    return search_docs

@traceable
def perplexity_search(search_queries):
    """Search the web using the Perplexity API.
    
    Args:
        search_queries (List[SearchQuery]): List of search queries to process
  
    Returns:
        List[dict]: List of search responses from Perplexity API, one per query. Each response has format:
            {
                'query': str,                    # The original search query
                'follow_up_questions': None,      
                'answer': None,
                'images': list,
                'results': [                     # List of search results
                    {
                        'title': str,            # Title of the search result
                        'url': str,              # URL of the result
                        'content': str,          # Summary/snippet of content
                        'score': float,          # Relevance score
                        'raw_content': str|None  # Full content or None for secondary citations
                    },
                    ...
                ]
            }
    """

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": f"Bearer {os.getenv('PERPLEXITY_API_KEY')}"
    }
    
    search_docs = []
    for query in search_queries:

        payload = {
            "model": "sonar-pro",
            "messages": [
                {
                    "role": "system",
                    "content": "Search the web and provide factual information with sources."
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
        }
        
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse the response
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        citations = data.get("citations", ["https://perplexity.ai"])
        
        # Create results list for this query
        results = []
        
        # First citation gets the full content
        results.append({
            "title": f"Perplexity Search, Source 1",
            "url": citations[0],
            "content": content,
            "raw_content": content,
            "score": 1.0  # Adding score to match Tavily format
        })
        
        # Add additional citations without duplicating content
        for i, citation in enumerate(citations[1:], start=2):
            results.append({
                "title": f"Perplexity Search, Source {i}",
                "url": citation,
                "content": "See primary source for full content",
                "raw_content": None,
                "score": 0.5  # Lower score for secondary sources
            })
        
        # Format response to match Tavily structure
        search_docs.append({
            "query": query,
            "follow_up_questions": None,
            "answer": None,
            "images": [],
            "results": results
        })
    
    return search_docs

@traceable
async def exa_search(search_queries, max_characters: Optional[int] = None, num_results=5, 
                     include_domains: Optional[List[str]] = None, 
                     exclude_domains: Optional[List[str]] = None,
                     subpages: Optional[int] = None):
    """Search the web using the Exa API.
    
    Args:
        search_queries (List[SearchQuery]): List of search queries to process
        max_characters (int, optional): Maximum number of characters to retrieve for each result's raw content.
                                       If None, the text parameter will be set to True instead of an object.
        num_results (int): Number of search results per query. Defaults to 5.
        include_domains (List[str], optional): List of domains to include in search results. 
            When specified, only results from these domains will be returned.
        exclude_domains (List[str], optional): List of domains to exclude from search results.
            Cannot be used together with include_domains.
        subpages (int, optional): Number of subpages to retrieve per result. If None, subpages are not retrieved.
        
    Returns:
        List[dict]: List of search responses from Exa API, one per query. Each response has format:
            {
                'query': str,                    # The original search query
                'follow_up_questions': None,      
                'answer': None,
                'images': list,
                'results': [                     # List of search results
                    {
                        'title': str,            # Title of the search result
                        'url': str,              # URL of the result
                        'content': str,          # Summary/snippet of content
                        'score': float,          # Relevance score
                        'raw_content': str|None  # Full content or None for secondary citations
                    },
                    ...
                ]
            }
    """
    # Check that include_domains and exclude_domains are not both specified
    if include_domains and exclude_domains:
        raise ValueError("Cannot specify both include_domains and exclude_domains")
    
    # Initialize Exa client (API key should be configured in your .env file)
    exa = Exa(api_key = f"{os.getenv('EXA_API_KEY')}")
    
    # Define the function to process a single query
    async def process_query(query):
        # Use run_in_executor to make the synchronous exa call in a non-blocking way
        loop = asyncio.get_event_loop()
        
        # Define the function for the executor with all parameters
        def exa_search_fn():
            # Build parameters dictionary
            kwargs = {
                # Set text to True if max_characters is None, otherwise use an object with max_characters
                "text": True if max_characters is None else {"max_characters": max_characters},
                "summary": True,  # This is an amazing feature by EXA. It provides an AI generated summary of the content based on the query
                "num_results": num_results
            }
            
            # Add optional parameters only if they are provided
            if subpages is not None:
                kwargs["subpages"] = subpages
                
            if include_domains:
                kwargs["include_domains"] = include_domains
            elif exclude_domains:
                kwargs["exclude_domains"] = exclude_domains
                
            return exa.search_and_contents(query, **kwargs)
        
        response = await loop.run_in_executor(None, exa_search_fn)
        
        # Format the response to match the expected output structure
        formatted_results = []
        seen_urls = set()  # Track URLs to avoid duplicates
        
        # Helper function to safely get value regardless of if item is dict or object
        def get_value(item, key, default=None):
            if isinstance(item, dict):
                return item.get(key, default)
            else:
                return getattr(item, key, default) if hasattr(item, key) else default
        
        # Access the results from the SearchResponse object
        results_list = get_value(response, 'results', [])
        
        # First process all main results
        for result in results_list:
            # Get the score with a default of 0.0 if it's None or not present
            score = get_value(result, 'score', 0.0)
            
            # Combine summary and text for content if both are available
            text_content = get_value(result, 'text', '')
            summary_content = get_value(result, 'summary', '')
            
            content = text_content
            if summary_content:
                if content:
                    content = f"{summary_content}\n\n{content}"
                else:
                    content = summary_content
            
            title = get_value(result, 'title', '')
            url = get_value(result, 'url', '')
            
            # Skip if we've seen this URL before (removes duplicate entries)
            if url in seen_urls:
                continue
                
            seen_urls.add(url)
            
            # Main result entry
            result_entry = {
                "title": title,
                "url": url,
                "content": content,
                "score": score,
                "raw_content": text_content
            }
            
            # Add the main result to the formatted results
            formatted_results.append(result_entry)
        
        # Now process subpages only if the subpages parameter was provided
        if subpages is not None:
            for result in results_list:
                subpages_list = get_value(result, 'subpages', [])
                for subpage in subpages_list:
                    # Get subpage score
                    subpage_score = get_value(subpage, 'score', 0.0)
                    
                    # Combine summary and text for subpage content
                    subpage_text = get_value(subpage, 'text', '')
                    subpage_summary = get_value(subpage, 'summary', '')
                    
                    subpage_content = subpage_text
                    if subpage_summary:
                        if subpage_content:
                            subpage_content = f"{subpage_summary}\n\n{subpage_content}"
                        else:
                            subpage_content = subpage_summary
                    
                    subpage_url = get_value(subpage, 'url', '')
                    
                    # Skip if we've seen this URL before
                    if subpage_url in seen_urls:
                        continue
                        
                    seen_urls.add(subpage_url)
                    
                    formatted_results.append({
                        "title": get_value(subpage, 'title', ''),
                        "url": subpage_url,
                        "content": subpage_content,
                        "score": subpage_score,
                        "raw_content": subpage_text
                    })
        
        # Collect images if available (only from main results to avoid duplication)
        images = []
        for result in results_list:
            image = get_value(result, 'image')
            if image and image not in images:  # Avoid duplicate images
                images.append(image)
                
        return {
            "query": query,
            "follow_up_questions": None,
            "answer": None,
            "images": images,
            "results": formatted_results
        }
    
    # Process all queries sequentially with delay to respect rate limit
    search_docs = []
    for i, query in enumerate(search_queries):
        try:
            # Add delay between requests (0.25s = 4 requests per second, well within the 5/s limit)
            if i > 0:  # Don't delay the first request
                await asyncio.sleep(0.25)
            
            result = await process_query(query)
            search_docs.append(result)
        except Exception as e:
            # Handle exceptions gracefully
            print(f"Error processing query '{query}': {str(e)}")
            # Add a placeholder result for failed queries to maintain index alignment
            search_docs.append({
                "query": query,
                "follow_up_questions": None,
                "answer": None,
                "images": [],
                "results": [],
                "error": str(e)
            })
            
            # Add additional delay if we hit a rate limit error
            if "429" in str(e):
                print("Rate limit exceeded. Adding additional delay...")
                await asyncio.sleep(1.0)  # Add a longer delay if we hit a rate limit
    
    return search_docs

@traceable
async def arxiv_search_async(search_queries, load_max_docs=5, get_full_documents=True, load_all_available_meta=True):
    """
    Performs concurrent searches on arXiv using the ArxivRetriever.

    Args:
        search_queries (List[str]): List of search queries or article IDs
        load_max_docs (int, optional): Maximum number of documents to return per query. Default is 5.
        get_full_documents (bool, optional): Whether to fetch full text of documents. Default is True.
        load_all_available_meta (bool, optional): Whether to load all available metadata. Default is True.

    Returns:
        List[dict]: List of search responses from arXiv, one per query. Each response has format:
            {
                'query': str,                    # The original search query
                'follow_up_questions': None,      
                'answer': None,
                'images': [],
                'results': [                     # List of search results
                    {
                        'title': str,            # Title of the paper
                        'url': str,              # URL (Entry ID) of the paper
                        'content': str,          # Formatted summary with metadata
                        'score': float,          # Relevance score (approximated)
                        'raw_content': str|None  # Full paper content if available
                    },
                    ...
                ]
            }
    """
    
    async def process_single_query(query):
        try:
            # Create retriever for each query
            retriever = ArxivRetriever(
                load_max_docs=load_max_docs,
                get_full_documents=get_full_documents,
                load_all_available_meta=load_all_available_meta
            )
            
            # Run the synchronous retriever in a thread pool
            loop = asyncio.get_event_loop()
            docs = await loop.run_in_executor(None, lambda: retriever.invoke(query))
            
            results = []
            # Assign decreasing scores based on the order
            base_score = 1.0
            score_decrement = 1.0 / (len(docs) + 1) if docs else 0
            
            for i, doc in enumerate(docs):
                # Extract metadata
                metadata = doc.metadata
                
                # Use entry_id as the URL (this is the actual arxiv link)
                url = metadata.get('entry_id', '')
                
                # Format content with all useful metadata
                content_parts = []

                # Primary information
                if 'Summary' in metadata:
                    content_parts.append(f"Summary: {metadata['Summary']}")

                if 'Authors' in metadata:
                    content_parts.append(f"Authors: {metadata['Authors']}")

                # Add publication information
                published = metadata.get('Published')
                published_str = published.isoformat() if hasattr(published, 'isoformat') else str(published) if published else ''
                if published_str:
                    content_parts.append(f"Published: {published_str}")

                # Add additional metadata if available
                if 'primary_category' in metadata:
                    content_parts.append(f"Primary Category: {metadata['primary_category']}")

                if 'categories' in metadata and metadata['categories']:
                    content_parts.append(f"Categories: {', '.join(metadata['categories'])}")

                if 'comment' in metadata and metadata['comment']:
                    content_parts.append(f"Comment: {metadata['comment']}")

                if 'journal_ref' in metadata and metadata['journal_ref']:
                    content_parts.append(f"Journal Reference: {metadata['journal_ref']}")

                if 'doi' in metadata and metadata['doi']:
                    content_parts.append(f"DOI: {metadata['doi']}")

                # Get PDF link if available in the links
                pdf_link = ""
                if 'links' in metadata and metadata['links']:
                    for link in metadata['links']:
                        if 'pdf' in link:
                            pdf_link = link
                            content_parts.append(f"PDF: {pdf_link}")
                            break

                # Join all content parts with newlines 
                content = "\n".join(content_parts)
                
                result = {
                    'title': metadata.get('Title', ''),
                    'url': url,  # Using entry_id as the URL
                    'content': content,
                    'score': base_score - (i * score_decrement),
                    'raw_content': doc.page_content if get_full_documents else None
                }
                results.append(result)
                
            return {
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': results
            }
        except Exception as e:
            # Handle exceptions gracefully
            print(f"Error processing arXiv query '{query}': {str(e)}")
            return {
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': [],
                'error': str(e)
            }
    
    # Process queries sequentially with delay to respect arXiv rate limit (1 request per 3 seconds)
    search_docs = []
    for i, query in enumerate(search_queries):
        try:
            # Add delay between requests (3 seconds per ArXiv's rate limit)
            if i > 0:  # Don't delay the first request
                await asyncio.sleep(3.0)
            
            result = await process_single_query(query)
            search_docs.append(result)
        except Exception as e:
            # Handle exceptions gracefully
            print(f"Error processing arXiv query '{query}': {str(e)}")
            search_docs.append({
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': [],
                'error': str(e)
            })
            
            # Add additional delay if we hit a rate limit error
            if "429" in str(e) or "Too Many Requests" in str(e):
                print("ArXiv rate limit exceeded. Adding additional delay...")
                await asyncio.sleep(5.0)  # Add a longer delay if we hit a rate limit
    
    return search_docs

@traceable
async def pubmed_search_async(search_queries, top_k_results=5, email=None, api_key=None, doc_content_chars_max=4000):
    """
    Performs concurrent searches on PubMed using the PubMedAPIWrapper.

    Args:
        search_queries (List[str]): List of search queries
        top_k_results (int, optional): Maximum number of documents to return per query. Default is 5.
        email (str, optional): Email address for PubMed API. Required by NCBI.
        api_key (str, optional): API key for PubMed API for higher rate limits.
        doc_content_chars_max (int, optional): Maximum characters for document content. Default is 4000.

    Returns:
        List[dict]: List of search responses from PubMed, one per query. Each response has format:
            {
                'query': str,                    # The original search query
                'follow_up_questions': None,      
                'answer': None,
                'images': [],
                'results': [                     # List of search results
                    {
                        'title': str,            # Title of the paper
                        'url': str,              # URL to the paper on PubMed
                        'content': str,          # Formatted summary with metadata
                        'score': float,          # Relevance score (approximated)
                        'raw_content': str       # Full abstract content
                    },
                    ...
                ]
            }
    """
    
    async def process_single_query(query):
        try:
            # print(f"Processing PubMed query: '{query}'")
            
            # Create PubMed wrapper for the query
            wrapper = PubMedAPIWrapper(
                top_k_results=top_k_results,
                doc_content_chars_max=doc_content_chars_max,
                email=email if email else "your_email@example.com",
                api_key=api_key if api_key else ""
            )
            
            # Run the synchronous wrapper in a thread pool
            loop = asyncio.get_event_loop()
            
            # Use wrapper.lazy_load instead of load to get better visibility
            docs = await loop.run_in_executor(None, lambda: list(wrapper.lazy_load(query)))
            
            print(f"Query '{query}' returned {len(docs)} results")
            
            results = []
            # Assign decreasing scores based on the order
            base_score = 1.0
            score_decrement = 1.0 / (len(docs) + 1) if docs else 0
            
            for i, doc in enumerate(docs):
                # Format content with metadata
                content_parts = []
                
                if doc.get('Published'):
                    content_parts.append(f"Published: {doc['Published']}")
                
                if doc.get('Copyright Information'):
                    content_parts.append(f"Copyright Information: {doc['Copyright Information']}")
                
                if doc.get('Summary'):
                    content_parts.append(f"Summary: {doc['Summary']}")
                
                # Generate PubMed URL from the article UID
                uid = doc.get('uid', '')
                url = f"https://pubmed.ncbi.nlm.nih.gov/{uid}/" if uid else ""
                
                # Join all content parts with newlines
                content = "\n".join(content_parts)
                
                result = {
                    'title': doc.get('Title', ''),
                    'url': url,
                    'content': content,
                    'score': base_score - (i * score_decrement),
                    'raw_content': doc.get('Summary', '')
                }
                results.append(result)
            
            return {
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': results
            }
        except Exception as e:
            # Handle exceptions with more detailed information
            error_msg = f"Error processing PubMed query '{query}': {str(e)}"
            print(error_msg)
            import traceback
            print(traceback.format_exc())  # Print full traceback for debugging
            
            return {
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': [],
                'error': str(e)
            }
    
    # Process all queries with a reasonable delay between them
    search_docs = []
    
    # Start with a small delay that increases if we encounter rate limiting
    delay = 1.0  # Start with a more conservative delay
    
    for i, query in enumerate(search_queries):
        try:
            # Add delay between requests
            if i > 0:  # Don't delay the first request
                # print(f"Waiting {delay} seconds before next query...")
                await asyncio.sleep(delay)
            
            result = await process_single_query(query)
            search_docs.append(result)
            
            # If query was successful with results, we can slightly reduce delay (but not below minimum)
            if result.get('results') and len(result['results']) > 0:
                delay = max(0.5, delay * 0.9)  # Don't go below 0.5 seconds
            
        except Exception as e:
            # Handle exceptions gracefully
            error_msg = f"Error in main loop processing PubMed query '{query}': {str(e)}"
            print(error_msg)
            
            search_docs.append({
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': [],
                'error': str(e)
            })
            
            # If we hit an exception, increase delay for next query
            delay = min(5.0, delay * 1.5)  # Don't exceed 5 seconds
    
    return search_docs

@traceable
async def linkup_search(search_queries, depth: Optional[str] = "standard"):
    """Placeholder for linkup search."""
    print("Using dummy linkup_search implementation")
    search_results = []
    for query in search_queries:
        search_results.append({
            "query": query,
            "follow_up_questions": None,
            "answer": None,
            "images": [],
            "results": []
        })
    return search_results

@traceable
async def duckduckgo_search(search_queries):
    """Perform searches using DuckDuckGo with improved rate limit handling
    
    Args:
        search_queries (List[str]): List of search queries to process
        
    Returns:
        List[dict]: List of search results
    """
    search_results = []
    
    # Process queries sequentially with delays between them to avoid rate limiting
    for i, query in enumerate(search_queries):
        try:
            # Add progressively longer delays between requests
            if i > 0:
                delay = 2 + (i * 0.5) + (random.random() * 1.0)  # Increasing delay pattern
                print(f"DuckDuckGo search: waiting {delay:.2f}s before query {i+1}/{len(search_queries)}")
                await asyncio.sleep(delay)
            
            # Use our single-query function with retries
            result = await execute_duckduckgo_search_with_retry(query)
            search_results.append(result)
            
        except Exception as e:
            print(f"Error in DuckDuckGo search for '{query}': {str(e)}")
            # Add an error result to maintain the same length as search_queries
            search_results.append({
                'query': query,
                'follow_up_questions': None,
                'answer': None,
                'images': [],
                'results': [],
                'error': str(e)
            })
            
            # If we hit a rate limit, add an extra long delay before the next query
            if "Ratelimit" in str(e):
                extra_delay = 10 + random.random() * 5
                print(f"Rate limit hit. Adding extra {extra_delay:.2f}s delay...")
                await asyncio.sleep(extra_delay)
    
    return search_results

@retry_with_exponential_backoff(max_retries=5, base_delay=2.0)
async def execute_search(search_api: str, query: str, params: dict) -> list:
    """Execute a search with the given API and parameters."""
    # Your existing search code...

# First, enhance the select_and_execute_search function to include fallback logic
async def select_and_execute_search(search_api: str, query_list: list[str], params_to_pass: dict) -> str:
    """Select and execute the appropriate search API with fallback support for rate limiting."""
    try:
        # First, try with the requested search API
        if search_api == "duckduckgo":
            try:
                # Process only first 2-3 queries to reduce chance of rate limiting
                limited_queries = query_list[:min(3, len(query_list))]
                
                # Add longer delays between searches
                search_results = []
                for i, query in enumerate(limited_queries):
                    # Add delay between requests to avoid rate limiting
                    if i > 0:
                        print(f"Adding delay between DuckDuckGo searches ({i}/{len(limited_queries)})...")
                        await asyncio.sleep(2 + random.random() * 2)  # 2-4 second random delay
                    
                    # Execute single query with retries
                    result = await execute_duckduckgo_search_with_retry(query)
                    search_results.append(result)
                
                return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
            except Exception as e:
                if "Ratelimit" in str(e):
                    print(f"DuckDuckGo rate limited. Falling back to Exa API: {e}")
                    # Fall back to Exa API
                    search_api = "exa"
                    exa_params = get_search_params("exa", {})
                    exa_params.update(params_to_pass)  # Merge any passed params
                    search_results = await exa_search(query_list, **exa_params)
                    return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
                else:
                    # Re-raise if it's not a rate limit error
                    raise
        
        # Regular processing for other APIs
        if search_api == "tavily":
            search_results = await tavily_search_async(query_list, **params_to_pass)
        elif search_api == "perplexity":
            search_results = perplexity_search(query_list, **params_to_pass)
        elif search_api == "exa":
            search_results = await exa_search(query_list, **params_to_pass)
        elif search_api == "arxiv":
            search_results = await arxiv_search_async(query_list, **params_to_pass)
        elif search_api == "pubmed":
            search_results = await pubmed_search_async(query_list, **params_to_pass)
        elif search_api == "linkup":
            search_results = await linkup_search(query_list, **params_to_pass)
        elif search_api == "googlesearch":
            search_results = await google_search_async(query_list, **params_to_pass)
        else:
            raise ValueError(f"Unsupported search API: {search_api}")
            
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    except Exception as e:
        print(f"Error in search (API: {search_api}): {str(e)}")
        # If all else fails, return an error message that can be used in the report
        return f"""
        [Search Error: Unable to retrieve information]
        
        The search system encountered an error while trying to find information.
        Error details: {str(e)}
        
        The following queries were attempted:
        {chr(10).join('- ' + q for q in query_list)}
        
        Please proceed with general knowledge about the topic.
        """

# Add a new helper function specifically for DuckDuckGo with retry logic
async def execute_duckduckgo_search_with_retry(query, max_retries=5):
    """Execute a single DuckDuckGo search with retries and exponential backoff."""
    retries = 0
    base_delay = 2.0
    jitter = 0.5
    
    while True:
        try:
            # Execute synchronous search in the event loop's thread pool
            loop = asyncio.get_event_loop()
            
            def perform_search():
                results = []
                with DDGS() as ddgs:
                    # Use a smaller max_results to reduce likelihood of rate limiting
                    ddg_results = list(ddgs.text(query, max_results=3))
                    
                    # Format results
                    for i, result in enumerate(ddg_results):
                        results.append({
                            'title': result.get('title', ''),
                            'url': result.get('link', ''),
                            'content': result.get('body', ''),
                            'score': 1.0 - (i * 0.1),
                            'raw_content': result.get('body', '')
                        })
                return {
                    'query': query,
                    'follow_up_questions': None,
                    'answer': None,
                    'images': [],
                    'results': results
                }
                
            return await loop.run_in_executor(None, perform_search)
            
        except Exception as e:
            # Check if it's a rate limit error
            if "Ratelimit" in str(e) and retries < max_retries:
                retries += 1
                # Calculate delay with jitter
                delay = base_delay * (2 ** retries) + random.uniform(0, jitter)
                print(f"DuckDuckGo search rate-limited. Retrying in {delay:.2f} seconds (attempt {retries}/{max_retries})...")
                await asyncio.sleep(delay)
            else:
                # If max retries exceeded or different error, re-raise
                raise

@traceable
async def google_search_async(search_queries: Union[str, List[str]], max_results: int = 5, include_raw_content: bool = True):
    """
    Performs concurrent web searches using Google.
    Uses Google Custom Search API if environment variables are set, otherwise falls back to web scraping.

    Args:
        search_queries (List[str]): List of search queries to process
        max_results (int): Maximum number of results to return per query
        include_raw_content (bool): Whether to fetch full page content

    Returns:
        List[dict]: List of search responses from Google, one per query
    """


    # Check for API credentials from environment variables
    api_key = os.environ.get("GOOGLE_API_KEY")
    cx = os.environ.get("GOOGLE_CX")
    use_api = bool(api_key and cx)
    
    # Handle case where search_queries is a single string
    if isinstance(search_queries, str):
        search_queries = [search_queries]
    
    # Define user agent generator
    def get_useragent():
        """Generates a random user agent string."""
        lynx_version = f"Lynx/{random.randint(2, 3)}.{random.randint(8, 9)}.{random.randint(0, 2)}"
        libwww_version = f"libwww-FM/{random.randint(2, 3)}.{random.randint(13, 15)}"
        ssl_mm_version = f"SSL-MM/{random.randint(1, 2)}.{random.randint(3, 5)}"
        openssl_version = f"OpenSSL/{random.randint(1, 3)}.{random.randint(0, 4)}.{random.randint(0, 9)}"
        return f"{lynx_version} {libwww_version} {ssl_mm_version} {openssl_version}"
    
    # Create executor for running synchronous operations
    executor = None if use_api else concurrent.futures.ThreadPoolExecutor(max_workers=5)
    
    # Use a semaphore to limit concurrent requests
    semaphore = asyncio.Semaphore(5 if use_api else 2)
    
    async def search_single_query(query):
        async with semaphore:
            try:
                results = []
                
                # API-based search
                if use_api:
                    # The API returns up to 10 results per request
                    for start_index in range(1, max_results + 1, 10):
                        # Calculate how many results to request in this batch
                        num = min(10, max_results - (start_index - 1))
                        
                        # Make request to Google Custom Search API
                        params = {
                            'q': query,
                            'key': api_key,
                            'cx': cx,
                            'start': start_index,
                            'num': num
                        }
                        print(f"Requesting {num} results for '{query}' from Google API...")

                        async with aiohttp.ClientSession() as session:
                            async with session.get('https://www.googleapis.com/customsearch/v1', params=params) as response:
                                if response.status != 200:
                                    error_text = await response.text()
                                    print(f"API error: {response.status}, {error_text}")
                                    break
                                    
                                data = await response.json()
                                
                                # Process search results
                                for item in data.get('items', []):
                                    result = {
                                        "title": item.get('title', ''),
                                        "url": item.get('link', ''),
                                        "content": item.get('snippet', ''),
                                        "score": None,
                                        "raw_content": item.get('snippet', '')
                                    }
                                    results.append(result)
                        
                        # Respect API quota with a small delay
                        await asyncio.sleep(0.2)
                        
                        # If we didn't get a full page of results, no need to request more
                        if not data.get('items') or len(data.get('items', [])) < num:
                            break
                
                # Web scraping based search
                else:
                    # Add delay between requests
                    await asyncio.sleep(0.5 + random.random() * 1.5)
                    print(f"Scraping Google for '{query}'...")

                    # Define scraping function
                    def google_search(query, max_results):
                        try:
                            lang = "en"
                            safe = "active"
                            start = 0
                            fetched_results = 0
                            fetched_links = set()
                            search_results = []
                            
                            while fetched_results < max_results:
                                # Send request to Google
                                resp = requests.get(
                                    url="https://www.google.com/search",
                                    headers={
                                        "User-Agent": get_useragent(),
                                        "Accept": "*/*"
                                    },
                                    params={
                                        "q": query,
                                        "num": max_results + 2,
                                        "hl": lang,
                                        "start": start,
                                        "safe": safe,
                                    },
                                    cookies = {
                                        'CONSENT': 'PENDING+987',  # Bypasses the consent page
                                        'SOCS': 'CAESHAgBEhIaAB',
                                    }
                                )
                                resp.raise_for_status()
                                
                                # Parse results
                                soup = BeautifulSoup(resp.text, "html.parser")
                                result_block = soup.find_all("div", class_="ezO2md")
                                new_results = 0
                                
                                for result in result_block:
                                    link_tag = result.find("a", href=True)
                                    title_tag = link_tag.find("span", class_="CVA68e") if link_tag else None
                                    description_tag = result.find("span", class_="FrIlee")
                                    
                                    if link_tag and title_tag and description_tag:
                                        link = unquote(link_tag["href"].split("&")[0].replace("/url?q=", ""))
                                        
                                        if link in fetched_links:
                                            continue
                                        
                                        fetched_links.add(link)
                                        title = title_tag.text
                                        description = description_tag.text
                                        
                                        # Store result in the same format as the API results
                                        search_results.append({
                                            "title": title,
                                            "url": link,
                                            "content": description,
                                            "score": None,
                                            "raw_content": description
                                        })
                                        
                                        fetched_results += 1
                                        new_results += 1
                                        
                                        if fetched_results >= max_results:
                                            break
                                
                                if new_results == 0:
                                    break
                                    
                                start += 10
                                time.sleep(1)  # Delay between pages
                            
                            return search_results
                                
                        except Exception as e:
                            print(f"Error in Google search for '{query}': {str(e)}")
                            return []
                    
                    # Execute search in thread pool
                    loop = asyncio.get_running_loop()
                    search_results = await loop.run_in_executor(
                        executor, 
                        lambda: google_search(query, max_results)
                    )
                    
                    # Process the results
                    results = search_results
                
                # If requested, fetch full page content asynchronously (for both API and web scraping)
                if include_raw_content and results:
                    content_semaphore = asyncio.Semaphore(3)
                    
                    async with aiohttp.ClientSession() as session:
                        fetch_tasks = []
                        
                        async def fetch_full_content(result):
                            async with content_semaphore:
                                url = result['url']
                                headers = {
                                    'User-Agent': get_useragent(),
                                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                                }
                                
                                try:
                                    await asyncio.sleep(0.2 + random.random() * 0.6)
                                    async with session.get(url, headers=headers, timeout=10) as response:
                                        if response.status == 200:
                                            # Check content type to handle binary files
                                            content_type = response.headers.get('Content-Type', '').lower()
                                            
                                            # Handle PDFs and other binary files
                                            if 'application/pdf' in content_type or 'application/octet-stream' in content_type:
                                                # For PDFs, indicate that content is binary and not parsed
                                                result['raw_content'] = f"[Binary content: {content_type}. Content extraction not supported for this file type.]"
                                            else:
                                                try:
                                                    # Try to decode as UTF-8 with replacements for non-UTF8 characters
                                                    html = await response.text(errors='replace')
                                                    soup = BeautifulSoup(html, 'html.parser')
                                                    result['raw_content'] = soup.get_text()
                                                except UnicodeDecodeError as ude:
                                                    # Fallback if we still have decoding issues
                                                    result['raw_content'] = f"[Could not decode content: {str(ude)}]"
                                except Exception as e:
                                    print(f"Warning: Failed to fetch content for {url}: {str(e)}")
                                    result['raw_content'] = f"[Error fetching content: {str(e)}]"
                                return result
                        
                        for result in results:
                            fetch_tasks.append(fetch_full_content(result))
                        
                        updated_results = await asyncio.gather(*fetch_tasks)
                        results = updated_results
                        print(f"Fetched full content for {len(results)} results")
                
                return {
                    "query": query,
                    "follow_up_questions": None,
                    "answer": None,
                    "images": [],
                    "results": results
                }
            except Exception as e:
                print(f"Error in Google search for query '{query}': {str(e)}")
                return {
                    "query": query,
                    "follow_up_questions": None,
                    "answer": None,
                    "images": [],
                    "results": []
                }
    
    try:
        # Create tasks for all search queries
        search_tasks = [search_single_query(query) for query in search_queries]
        
        # Execute all searches concurrently
        search_results = await asyncio.gather(*search_tasks)
        
        return search_results
    finally:
        # Only shut down executor if it was created
        if executor:
            executor.shutdown(wait=False)



async def select_and_execute_search(search_api: str, query_list: list[str], params_to_pass: dict) -> str:
    """Select and execute the appropriate search API.
    
    Args:
        search_api: Name of the search API to use
        query_list: List of search queries to execute
        params_to_pass: Parameters to pass to the search API
        
    Returns:
        Formatted string containing search results
        
    Raises:
        ValueError: If an unsupported search API is specified
    """
    if search_api == "tavily":
        search_results = await tavily_search_async(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000, include_raw_content=False)
    elif search_api == "perplexity":
        search_results = perplexity_search(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "exa":
        search_results = await exa_search(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "arxiv":
        search_results = await arxiv_search_async(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "pubmed":
        search_results = await pubmed_search_async(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "linkup":
        search_results = await linkup_search(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "duckduckgo":
        search_results = await duckduckgo_search(query_list)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    elif search_api == "googlesearch":
        search_results = await google_search_async(query_list, **params_to_pass)
        return deduplicate_and_format_sources(search_results, max_tokens_per_source=4000)
    else:
        raise ValueError(f"Unsupported search API: {search_api}")

def init_model_with_provider(model_name: str, provider: str, **kwargs) -> BaseChatModel:
    """Initialize a chat model with proper provider-specific settings."""
    try:
        if provider == "groq":
            # Import the Groq provider directly
            from langchain_groq import ChatGroq
            
            # Check for API key
            import os
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY environment variable not set")
                
            # Initialize Groq model directly
            return ChatGroq(
                model_name=model_name,
                groq_api_key=api_key,
                temperature=0.1
            )
        else:
            # Use standard init_chat_model for other providers
            return init_chat_model(model=model_name, model_provider=provider, **kwargs)
    except Exception as e:
        print(f"Error initializing model {model_name} with provider {provider}: {e}")
        raise
