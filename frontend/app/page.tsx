'use client';

import { useState, useEffect } from 'react';
import { Geist_Mono } from 'next/font/google';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const geistMono = Geist_Mono({ subsets: ['latin'] });

// Types
interface ReportRequest {
  topic: string;
  config_overrides?: Record<string, unknown>;
}

interface ReportResponse {
  topic: string;
  content: string;
}

// Simulated thought process stages with interesting details for a better user experience
const thoughtStages = [
  { text: "Planning report structure...", details: "Identifying key sections and topics to cover in the report" },
  { text: "Generating search queries...", details: "Creating specific search terms to find the most relevant information" },
  { text: "Searching for relevant information...", details: "Scanning through academic papers, websites, and trusted sources" },
  { text: "Analyzing search results...", details: "Evaluating sources for credibility and extracting key insights" },
  { text: "Writing report sections...", details: "Synthesizing information into coherent sections with proper citations" },
  { text: "Reviewing and refining content...", details: "Ensuring logical flow and checking for any factual inconsistencies" },
  { text: "Finalizing report...", details: "Formatting the report and preparing the final document" },
];

export default function Home() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  // Timer to update processing time and rotate through thought stages during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      interval = setInterval(() => {
        // Update processing time
        setProcessingTime(prev => prev + 1);
        
        // Every 10 seconds, move to next thought stage (simulating progress)
        if (processingTime > 0 && processingTime % 10 === 0 && currentStage < thoughtStages.length - 1) {
          setCurrentStage(prev => prev + 1);
        }
      }, 1000); // Update every second
    } else {
      setCurrentStage(0);
      setProcessingTime(0);
    }
    
    return () => clearInterval(interval);
  }, [isLoading, processingTime, currentStage]);

  // Generate report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setReport(null);
    setProcessingTime(0);
    setCurrentStage(0);
    
    try {
      const request: ReportRequest = {
        topic: topic,
      };
      
      // Show a user-friendly notification for long requests
      if (processingTime === 0) {
        // This will execute after the first render with isLoading=true
        setTimeout(() => {
          if (isLoading && processingTime < 5) {
            console.log("Informing user about potentially long wait time");
          }
        }, 5000);
      }
      
      // Get backend URL from environment variables with fallback
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress percentage calculation
  const progressPercentage = Math.min(100, ((currentStage + 1) / thoughtStages.length) * 100);

  return (
    <div className="min-h-screen bg-gray-900 from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <header className="py-6 px-4 border-b border-gray-200 dark:border-gray-800 bg-zinc-800 dark:bg-gray-950 shadow-sm">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
            Research Agent
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto max-w-5xl py-8 px-4">
        <section className="mb-10">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Research Topic</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a research topic (e.g., 'Quantum computing advances in 2024')"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-750 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="px-6 py-3 bg-indigo-500 hover:bg-blue-700  text-white rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 min-w-40"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Researching...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        </section>
        
        {isLoading && (
          <section className="mb-8 animate-fade-in">
            <div className="p-6 bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                <span className="animate-pulse rounded-full h-3 w-3 bg-green-100"></span>
                Research in Progress
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Processing time: {processingTime}s
                </p>
              </div>
              
              <div className="py-4 px-5 bg-gray-50 dark:bg-gray-950 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Task:</h3>
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  {thoughtStages[currentStage].text}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {thoughtStages[currentStage].details}
                </p>
              </div>
              
              <div className="py-4 px-5 bg-gray-50 dark:bg-gray-950 rounded-lg mb-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Research Process:</h3>
                <div className={`${geistMono.className} text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line`}>
                  {thoughtStages.map((stage, index) => (
                    <div key={index} className={`mb-3 flex items-start gap-2 ${index > currentStage ? 'opacity-40' : ''}`}>
                      <span className={index === currentStage ? "text-blue-500 font-bold mt-0.5" : "mt-0.5"}>
                        {index <= currentStage ? "✓" : "○"}
                      </span>
                      <div>
                        <div className={index === currentStage ? "text-blue-500 font-bold" : ""}>
                          {stage.text}
                        </div>
                        {index === currentStage && (
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-500">
                            {stage.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {processingTime > 30 && (
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>Thank you for your patience. Complex research topics may take a few minutes to process.</p>
                </div>
              )}
            </div>
          </section>
        )}
        
        {error && (
          <section className="mb-8 animate-fade-in">
            <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl">
              <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error</h2>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Troubleshooting Tips:</h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc pl-5 space-y-1">
                  <li>Check your internet connection</li>
                  <li>The server might be experiencing high load, try again in a few minutes</li>
                </ul>
              </div>
            </div>
          </section>
        )}
        
        {report && (
          <section className="animate-fade-in">
            <div className="p-6 bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Research Report
                </h2>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                  Completed
                </span>
              </div>
              
              {/* Markdown Renderer for the research report */}
              <article className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    h1: ({...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    p: ({...props}) => <p className="my-3" {...props} />,
                    a: ({...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                    ul: ({...props}) => <ul className="list-disc pl-6 my-3" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal pl-6 my-3" {...props} />,
                    li: ({...props}) => <li className="my-1" {...props} />,
                    blockquote: ({...props}) => (
                      <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4" {...props} />
                    ),
                    // code: ({inline, ...props}: any) => (
                    //   inline 
                    //     ? <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                    //     : <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto" {...props} />
                    // ),
                    table: ({...props}) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
                      </div>
                    ),
                    thead: ({...props}) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
                    th: ({...props}) => (
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white" {...props} />
                    ),
                    td: ({...props}) => (
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800" {...props} />
                    ),
                  }}
                >
                  {report.content}
                </ReactMarkdown>
              </article>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 border-blue-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Print / Save as PDF
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
