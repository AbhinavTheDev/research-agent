"use client";
import { useState, useEffect } from "react";
import { Geist_Mono } from "next/font/google";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { CardSpotlight } from "@/components/ui/animated-card";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
const geistMono = Geist_Mono({ subsets: ["latin"] });

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
  {
    text: "Planning report structure...",
    details: "Identifying key sections and topics to cover in the report",
  },
  {
    text: "Generating search queries...",
    details:
      "Creating specific search terms to find the most relevant information",
  },
  {
    text: "Searching for relevant information...",
    details: "Scanning through academic papers, websites, and trusted sources",
  },
  {
    text: "Analyzing search results...",
    details: "Evaluating sources for credibility and extracting key insights",
  },
  {
    text: "Writing report sections...",
    details:
      "Synthesizing information into coherent sections with proper citations",
  },
  {
    text: "Reviewing and refining content...",
    details:
      "Ensuring logical flow and checking for any factual inconsistencies",
  },
  {
    text: "Finalizing report...",
    details: "Formatting the report and preparing the final document",
  },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const placeholders = [
    "Quantum computing advances in 2024",
    "AI in healthcare: Transforming patient care",
    "Climate change impact on global agriculture",
    "The future of renewable energy technologies",
    "Exploring the metaverse: Opportunities and challenges",
  ];
  // Timer to update processing time and rotate through thought stages during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      interval = setInterval(() => {
        // Update processing time
        setProcessingTime((prev) => prev + 1);

        // Every 10 seconds, move to next thought stage (simulating progress)
        if (
          processingTime > 0 &&
          processingTime % 10 === 0 &&
          currentStage < thoughtStages.length - 1
        ) {
          setCurrentStage((prev) => prev + 1);
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate report");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Progress percentage calculation
  const progressPercentage = Math.min(
    100,
    ((currentStage + 1) / thoughtStages.length) * 100
  );

  return (
    <div className="relative w-full min-h-screen bg-black from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-15">
      <main className="container relative mx-auto max-w-5xl py-8 px-4 pt-12 z-10">
        {/* Hero section - only visible when not loading/showing results/errors */}
        {!isLoading && !report && !error && (
          <section className="animate-fade-in">
            <div className="flex flex-col items-center text-center mb-10">
              {/* Headline and description */}
              <h4 className="text-4xl font-bold bg-gradient-to-r from-orange-100 via-slate-400 to-red-100 bg-clip-text text-transparent">
                Research Agent
              </h4>
            </div>

            {/* Feature boxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <CardSpotlight className="h-56 w-56">
                <div>
                  <svg
                    width="54px"
                    height="54px"
                    viewBox="0 0 1024 1024"
                    className="relative z-20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M512.4 507.9m-232.1 0a232.1 232.1 0 1 0 464.2 0 232.1 232.1 0 1 0-464.2 0Z"
                        fill="#050505"
                      ></path>
                      <path
                        d="M513.8 874.9c-5.5 0-10-4.4-10-9.9s4.4-10 9.9-10.1c3.2 0 6.5-0.1 9.7-0.2 5.5-0.2 10.1 4.1 10.3 9.7 0.2 5.5-4.1 10.1-9.7 10.3-3.2 0.1-6.7 0.2-10.2 0.2 0.1 0 0.1 0 0 0z m-39.9-1.9c-0.3 0-0.7 0-1.1-0.1l-10.2-1.2c-5.5-0.7-9.3-5.8-8.6-11.2 0.7-5.5 5.8-9.3 11.2-8.6 3.2 0.4 6.4 0.8 9.6 1.1 5.5 0.6 9.5 5.5 8.9 11-0.4 5.2-4.7 9-9.8 9z m89.7-1.8c-4.9 0-9.2-3.6-9.9-8.6-0.8-5.5 3-10.5 8.5-11.3l9.6-1.5c5.4-0.9 10.6 2.7 11.6 8.1s-2.7 10.6-8.1 11.6c-3.4 0.6-6.8 1.1-10.2 1.6-0.5 0.1-1 0.1-1.5 0.1z m-138.8-6.9c-0.8 0-1.6-0.1-2.4-0.3-3.3-0.8-6.6-1.7-9.9-2.6-5.3-1.5-8.4-7-6.9-12.3 1.5-5.3 7-8.4 12.3-6.9 3.1 0.9 6.3 1.7 9.4 2.5 5.4 1.3 8.6 6.8 7.3 12.1-1.3 4.5-5.4 7.5-9.8 7.5z m187.6-3.8c-4.3 0-8.3-2.8-9.6-7.2-1.6-5.3 1.5-10.9 6.8-12.4 3.1-0.9 6.2-1.9 9.3-2.9 5.3-1.7 10.9 1.2 12.6 6.4 1.7 5.3-1.2 10.9-6.4 12.6-3.2 1.1-6.6 2.1-9.8 3-1 0.4-1.9 0.5-2.9 0.5z m-235.2-11.7c-1.3 0-2.5-0.2-3.8-0.7-3.2-1.3-6.4-2.6-9.5-4-5.1-2.2-7.4-8.1-5.1-13.2 2.2-5.1 8.1-7.4 13.2-5.1 3 1.3 6 2.6 9 3.8 5.1 2.1 7.6 7.9 5.5 13-1.6 3.9-5.3 6.2-9.3 6.2z m282.1-5.6c-3.8 0-7.4-2.2-9.1-5.9-2.3-5-0.1-11 5-13.2 2.9-1.3 5.9-2.7 8.8-4.1 5-2.4 11-0.4 13.4 4.6 2.4 5 0.4 11-4.6 13.4-3.1 1.5-6.2 3-9.3 4.4-1.5 0.5-2.9 0.8-4.2 0.8z m-327-16.4c-1.7 0-3.4-0.4-5-1.4-2.9-1.7-5.9-3.5-8.8-5.3-4.7-2.9-6.2-9.1-3.2-13.8 2.9-4.7 9.1-6.2 13.8-3.2 2.8 1.7 5.6 3.4 8.3 5 4.8 2.8 6.4 8.9 3.6 13.7-1.9 3.3-5.2 5-8.7 5z m370.9-7.4c-3.3 0-6.5-1.6-8.5-4.6-3-4.7-1.6-10.8 3.1-13.8 2.7-1.7 5.4-3.5 8.1-5.3a9.99 9.99 0 0 1 13.9 2.7 9.99 9.99 0 0 1-2.7 13.9c-2.8 1.9-5.7 3.8-8.6 5.6-1.7 1-3.5 1.5-5.3 1.5zM291 798.8c-2.2 0-4.3-0.7-6.2-2.1-2.7-2.1-5.4-4.3-8-6.5-4.2-3.5-4.8-9.8-1.3-14.1 3.5-4.2 9.8-4.8 14.1-1.3 2.5 2.1 5 4.1 7.6 6.1 4.3 3.4 5.1 9.7 1.7 14-2 2.6-5 3.9-7.9 3.9z m452.3-9c-2.8 0-5.6-1.2-7.6-3.5-3.6-4.2-3.1-10.5 1.1-14.1 2.5-2.1 4.9-4.2 7.3-6.4 4.1-3.7 10.4-3.4 14.1 0.7 3.7 4.1 3.4 10.4-0.7 14.1-2.5 2.3-5.1 4.6-7.7 6.8-1.9 1.6-4.2 2.4-6.5 2.4z m-489.4-24.5c-2.6 0-5.2-1-7.2-3.1-2.4-2.4-4.7-5-7-7.5-3.7-4.1-3.4-10.4 0.7-14.1 4.1-3.7 10.4-3.4 14.1 0.7 2.2 2.4 4.4 4.8 6.6 7.1 3.8 4 3.7 10.3-0.3 14.1-1.9 1.9-4.4 2.8-6.9 2.8zM779 754.9c-2.4 0-4.7-0.8-6.6-2.5-4.1-3.7-4.5-10-0.8-14.1 2.1-2.4 4.3-4.9 6.4-7.4 3.6-4.2 9.9-4.8 14.1-1.2s4.8 9.9 1.2 14.1c-2.2 2.6-4.5 5.2-6.7 7.8-2.1 2.1-4.8 3.3-7.6 3.3zM221.9 727c-3.1 0-6.1-1.4-8.1-4.1-2-2.8-4-5.6-5.9-8.4-3.1-4.6-2-10.8 2.6-13.9 4.6-3.1 10.8-2 13.9 2.6 1.8 2.7 3.7 5.3 5.6 7.9 3.2 4.5 2.2 10.7-2.2 14-1.8 1.3-3.9 1.9-5.9 1.9z m587.7-11.7c-1.9 0-3.8-0.5-5.5-1.7-4.6-3.1-5.8-9.3-2.8-13.9 1.8-2.7 3.6-5.4 5.3-8.2 2.9-4.7 9.1-6.1 13.8-3.2 4.7 2.9 6.1 9.1 3.2 13.8-1.8 2.9-3.7 5.8-5.6 8.6-2 3.1-5.2 4.6-8.4 4.6z m-614.2-30.6c-3.6 0-7-1.9-8.8-5.3-1.6-3-3.2-6.1-4.7-9.1-2.5-4.9-0.4-10.9 4.5-13.4 5-2.5 10.9-0.4 13.4 4.5 1.4 2.9 2.9 5.8 4.4 8.6 2.6 4.9 0.7 10.9-4.1 13.5-1.5 0.8-3.1 1.2-4.7 1.2z m638.9-12.8c-1.5 0-2.9-0.3-4.3-1-5-2.4-7.1-8.4-4.7-13.3 1.4-2.9 2.8-5.9 4.1-8.8 2.3-5 8.2-7.3 13.2-5.1 5 2.3 7.3 8.2 5.1 13.2-1.4 3.1-2.8 6.3-4.3 9.3-1.8 3.6-5.4 5.7-9.1 5.7zM175.2 639c-4.1 0-7.9-2.5-9.4-6.6-1.2-3.2-2.3-6.5-3.4-9.7-1.7-5.2 1.1-10.9 6.4-12.6 5.2-1.7 10.9 1.1 12.6 6.4 1 3.1 2.1 6.2 3.2 9.2 1.9 5.2-0.8 10.9-6 12.8-1.1 0.4-2.3 0.5-3.4 0.5z m677.5-13.6c-1 0-2-0.2-3-0.5-5.3-1.7-8.2-7.3-6.5-12.6 1-3.1 1.9-6.2 2.8-9.3 1.5-5.3 7.1-8.4 12.4-6.9 5.3 1.5 8.4 7.1 6.9 12.4-0.9 3.3-1.9 6.6-3 9.8-1.4 4.4-5.3 7.1-9.6 7.1zM161.5 591c-4.6 0-8.8-3.2-9.8-7.9-0.7-3.3-1.4-6.7-2-10.1-1-5.4 2.6-10.6 8.1-11.6 5.4-1 10.6 2.6 11.6 8.1 0.6 3.2 1.2 6.4 1.9 9.5 1.1 5.4-2.3 10.7-7.7 11.8-0.7 0.1-1.4 0.2-2.1 0.2z m702.9-14.1c-0.5 0-1.1 0-1.7-0.1-5.4-0.9-9.1-6.1-8.2-11.5l1.5-9.6c0.8-5.5 5.8-9.3 11.3-8.5 5.5 0.8 9.3 5.8 8.5 11.3-0.5 3.4-1 6.8-1.6 10.2-0.7 4.7-5 8.2-9.8 8.2z m-709.7-35.4c-5.2 0-9.6-4-10-9.3-0.2-3.4-0.4-6.9-0.5-10.3-0.2-5.5 4.1-10.2 9.6-10.4 5.5-0.2 10.2 4.1 10.4 9.6 0.1 3.2 0.3 6.5 0.5 9.7 0.4 5.5-3.8 10.3-9.3 10.6-0.3 0.1-0.5 0.1-0.7 0.1z m714.6-14.3h-0.3c-5.5-0.2-9.9-4.7-9.7-10.3 0.1-3.2 0.1-6.5 0.1-9.7 0-5.5 4.5-10 10-10s10 4.5 10 10c0 3.4 0 6.9-0.1 10.3-0.2 5.4-4.6 9.7-10 9.7z m-714.5-35.6h-0.7c-5.5-0.4-9.7-5.2-9.3-10.7 0.2-3.4 0.5-6.8 0.9-10.2 0.5-5.5 5.4-9.5 10.9-9s9.5 5.4 9 10.9c-0.3 3.2-0.6 6.5-0.8 9.7-0.4 5.3-4.8 9.3-10 9.3z m712.5-13c-5 0-9.4-3.8-9.9-8.9-0.3-3.2-0.7-6.4-1.2-9.6-0.7-5.5 3.1-10.5 8.6-11.3 5.5-0.7 10.5 3.1 11.3 8.6 0.5 3.4 0.9 6.8 1.2 10.2 0.6 5.5-3.4 10.4-8.9 11h-1.1z m-705.5-36.5c-0.7 0-1.4-0.1-2.1-0.2-5.4-1.2-8.8-6.5-7.7-11.9 0.7-3.4 1.5-6.7 2.3-10 1.3-5.4 6.7-8.7 12.1-7.4 5.4 1.3 8.7 6.7 7.4 12.1-0.8 3.1-1.5 6.3-2.2 9.5-1.1 4.7-5.2 7.9-9.8 7.9z m696.7-12.7c-4.5 0-8.5-3-9.7-7.6-0.8-3.1-1.6-6.3-2.5-9.4-1.5-5.3 1.6-10.8 6.9-12.3 5.3-1.5 10.8 1.6 12.3 6.9l2.7 9.9c1.4 5.4-1.9 10.8-7.3 12.1-0.7 0.3-1.5 0.4-2.4 0.4z m-682.9-35.3c-1.1 0-2.3-0.2-3.4-0.6-5.2-1.9-7.8-7.6-5.9-12.8 1.2-3.2 2.4-6.4 3.7-9.6 2-5.1 7.9-7.6 13-5.6s7.6 7.9 5.6 13c-1.2 3-2.4 6.1-3.5 9.1-1.6 4-5.4 6.5-9.5 6.5zM843 382c-3.9 0-7.7-2.3-9.3-6.2-1.2-3-2.5-6-3.8-8.9-2.2-5.1 0.1-11 5.1-13.2 5.1-2.2 11 0.1 13.2 5.1 1.4 3.1 2.7 6.3 4 9.4 2.1 5.1-0.4 11-5.5 13-1.2 0.5-2.5 0.8-3.7 0.8z m-646.9-33.5c-1.6 0-3.2-0.4-4.7-1.2-4.9-2.6-6.7-8.7-4.1-13.5 1.6-3 3.3-6.1 5-9 2.7-4.8 8.9-6.5 13.6-3.7 4.8 2.7 6.5 8.9 3.7 13.6-1.6 2.8-3.2 5.7-4.7 8.5-1.8 3.4-5.3 5.3-8.8 5.3z m624.8-11.3c-3.4 0-6.8-1.8-8.6-5-1.6-2.8-3.3-5.6-5-8.3-2.9-4.7-1.5-10.9 3.2-13.8 4.7-2.9 10.9-1.5 13.8 3.2 1.8 2.9 3.6 5.8 5.3 8.8 2.8 4.8 1.2 10.9-3.6 13.7-1.6 1-3.4 1.4-5.1 1.4z m-598.2-31c-2 0-4.1-0.6-5.9-1.9-4.5-3.3-5.4-9.5-2.2-14 2-2.8 4.1-5.5 6.2-8.2 3.4-4.4 9.7-5.2 14-1.8 4.4 3.4 5.2 9.7 1.8 14-2 2.5-3.9 5.1-5.8 7.8-2 2.7-5 4.1-8.1 4.1z m570.1-10.3c-3 0-5.9-1.3-7.9-3.8s-4-5.1-6.1-7.5c-3.5-4.2-3-10.5 1.3-14.1 4.2-3.5 10.5-3 14.1 1.3 2.2 2.6 4.4 5.3 6.5 8 3.4 4.3 2.7 10.6-1.7 14-1.8 1.4-4 2.1-6.2 2.1zM254.9 268c-2.5 0-5-0.9-7-2.8-4-3.8-4.1-10.2-0.2-14.1 2.4-2.4 4.8-4.9 7.3-7.3 4-3.9 10.3-3.8 14.1 0.2 3.9 4 3.8 10.3-0.2 14.1L262 265c-1.9 2-4.5 3-7.1 3z m504.3-9c-2.5 0-5-0.9-6.9-2.8-2.3-2.2-4.7-4.5-7.1-6.6-4.1-3.7-4.4-10-0.7-14.1s10-4.4 14.1-0.7c2.5 2.3 5.1 4.7 7.5 7 4 3.8 4.1 10.2 0.3 14.1-1.9 2-4.5 3.1-7.2 3.1z m-467.1-24.3c-3 0-5.9-1.3-7.9-3.9-3.4-4.4-2.6-10.6 1.7-14 2.7-2.1 5.4-4.2 8.2-6.2 4.5-3.3 10.7-2.3 14 2.1 3.3 4.5 2.3 10.7-2.1 14-2.6 1.9-5.2 3.9-7.7 5.9-1.9 1.4-4.1 2.1-6.2 2.1z m428.8-7.7c-2 0-4.1-0.6-5.8-1.9-2.6-1.9-5.3-3.8-8-5.6-4.6-3.1-5.7-9.3-2.6-13.9s9.3-5.7 13.9-2.6c2.8 1.9 5.7 3.9 8.4 5.9 4.5 3.2 5.5 9.5 2.3 14-2.1 2.6-5.1 4.1-8.2 4.1z m-387.4-20.2c-3.5 0-6.8-1.8-8.7-5-2.8-4.8-1.1-10.9 3.7-13.7 3-1.7 6-3.4 9-5 4.9-2.6 10.9-0.8 13.5 4.1 2.6 4.9 0.8 10.9-4.1 13.5-2.8 1.5-5.7 3.1-8.5 4.7-1.5 1-3.2 1.4-4.9 1.4z m344.9-6.2c-1.6 0-3.2-0.4-4.7-1.2-2.9-1.5-5.8-3-8.7-4.4-5-2.4-7-8.4-4.6-13.4 2.4-5 8.4-7 13.4-4.6 3.1 1.5 6.1 3.1 9.2 4.7 4.9 2.6 6.8 8.6 4.2 13.5-1.7 3.5-5.2 5.4-8.8 5.4z m-300-15.5c-4 0-7.7-2.4-9.3-6.3-2.1-5.1 0.4-10.9 5.6-13 3.2-1.3 6.4-2.5 9.6-3.7 5.2-1.9 10.9 0.7 12.8 5.9 1.9 5.2-0.7 10.9-5.9 12.8-3 1.1-6.1 2.3-9.1 3.5-1.2 0.5-2.4 0.8-3.7 0.8z m254.3-4.7c-1.1 0-2.3-0.2-3.4-0.6-3.1-1.1-6.2-2.2-9.2-3.2-5.2-1.7-8.1-7.4-6.4-12.6 1.7-5.2 7.4-8.1 12.6-6.4 3.2 1.1 6.5 2.2 9.8 3.4 5.2 1.9 7.9 7.6 6 12.8-1.5 4.1-5.3 6.6-9.4 6.6zM426 169.7c-4.5 0-8.6-3.1-9.7-7.6-1.3-5.4 2-10.8 7.3-12.1 3.3-0.8 6.7-1.6 10-2.3 5.4-1.2 10.7 2.3 11.9 7.7 1.2 5.4-2.3 10.7-7.7 11.9-3.1 0.7-6.3 1.4-9.5 2.2-0.7 0.2-1.6 0.2-2.3 0.2z m158.6-2.8c-0.7 0-1.4-0.1-2-0.2-3.1-0.7-6.4-1.3-9.5-1.8-5.4-1-9.1-6.2-8.1-11.6 1-5.4 6.2-9.1 11.6-8.1 3.4 0.6 6.8 1.3 10.1 1.9 5.4 1.1 8.9 6.4 7.8 11.8-1.1 4.7-5.3 8-9.9 8z m-109.4-5.6c-5.1 0-9.4-3.8-9.9-9-0.6-5.5 3.4-10.4 8.9-11l10.2-0.9c5.5-0.4 10.3 3.7 10.7 9.2s-3.7 10.3-9.2 10.7c-3.2 0.2-6.5 0.5-9.7 0.8-0.4 0.1-0.7 0.2-1 0.2z m59.9-1.1h-0.7c-3.2-0.2-6.5-0.4-9.7-0.5-5.5-0.2-9.8-4.8-9.6-10.4 0.2-5.5 4.8-9.8 10.4-9.6 3.4 0.1 6.9 0.3 10.3 0.5 5.5 0.4 9.7 5.1 9.3 10.6-0.4 5.3-4.8 9.4-10 9.4z"
                        fill="#fffafa"
                      ></path>
                      <path
                        d="M776.3 244.9c-14.9 0-27 12.1-27 27s12.1 27 27 27 27-12.1 27-27-12.1-27-27-27z"
                        fill="#fffafa"
                      ></path>
                      <path
                        d="M776.3 224.9c-25.9 0-47 21.1-47 47s21.1 47 47 47 47-21.1 47-47-21.1-47-47-47z m-27.1 47c0-14.9 12.1-27 27-27s27 12.1 27 27-12.1 27-27 27-27-12.1-27-27z"
                        fill="#fffafa"
                      ></path>
                      <path
                        d="M722.2 408H301c-3.1 6.5-5.9 13.2-8.3 20h437.9c-2.5-6.8-5.3-13.5-8.4-20z"
                        fill="#fffafa"
                      ></path>
                      <path
                        d="M704.5 314.3c-51.5-51.5-120-79.9-192.9-79.9s-141.4 28.4-192.9 79.9-79.9 120-79.9 192.9 28.4 141.4 79.9 192.9c51.5 51.5 120 79.9 192.9 79.9s141.4-28.4 192.9-79.9c51.5-51.5 79.9-120 79.9-192.9s-28.3-141.4-79.9-192.9zM303.6 611.5h87.1c1.1 3.2 2.3 6.4 3.5 9.6 11 28.4 26.3 55.6 45.4 80.8 10.2 13.4 20.3 24.8 29.5 34.1-72.5-13.4-133.3-60.5-165.5-124.5z m198 127.7c-12-10.4-29.4-27.2-46.6-50-14.7-19.5-30.9-45.6-43-77.8h89.6v127.8z m20 0V611.5h89.6c-12.1 32.1-28.3 58.3-43 77.8-17.2 22.8-34.6 39.5-46.6 49.9z m32.6-3.1c9.2-9.4 19.3-20.7 29.5-34.1 19.2-25.3 34.5-52.4 45.4-80.8 1.2-3.2 2.4-6.4 3.5-9.6h87.1c-32.2 63.9-93 111-165.5 124.5z m174.4-144.6h-89.8c7.3-26.5 11-53.9 11-81.8 0-27.7-3.7-55.1-10.9-81.8H618c7.2 24.6 11.7 51.9 11.7 81.8 0 30-4.6 57.4-11.8 81.8h-96.3V428h-20v163.5h-96.3c-7.2-24.4-11.8-51.7-11.8-81.8 0-29.8 4.6-57.2 11.7-81.8h-20.9c-7.2 26.7-10.9 54.1-10.9 81.8 0 27.9 3.7 55.2 11 81.8h-89.8c-10.2-26.2-15.8-54.6-15.8-84.3 0-27.8 4.9-54.5 13.9-79.2 2.5-6.8 5.3-13.5 8.3-20 31.7-67 94.5-116.6 169.7-130-9.6 10.1-20.4 22.4-31.2 37.1-19.1 26-34.4 53.8-45.4 82.5-1.3 3.4-2.5 6.9-3.7 10.4h21.3c12.2-33 28.6-60.2 43.4-80.5 17.2-23.4 34.5-40.8 46.5-51.7V408h20V275.8c12 10.9 29.3 28.4 46.5 51.7 14.9 20.3 31.3 47.4 43.4 80.5h21.3c-1.2-3.5-2.4-6.9-3.7-10.4-11-28.8-26.2-56.5-45.4-82.5-10.7-14.7-21.5-27.1-31.1-37.1 75.2 13.4 138 63 169.7 130 3.1 6.5 5.9 13.2 8.3 20 9 24.7 13.9 51.4 13.9 79.2-0.1 29.7-5.7 58.2-15.9 84.3z"
                        fill="#fffafa"
                      ></path>
                    </g>
                  </svg>
                </div>
                <p className="text-neutral-300 relative z-20 text-sm">
                  <span className="font-bold text-orange-200">
                    Research Agent
                  </span>{" "}
                  scans multiple sources instantly, saving hours of manual
                  searching and reading.
                </p>
              </CardSpotlight>
              <CardSpotlight className="h-56 w-56">
                <svg
                  width="54px"
                  height="54px"
                  viewBox="0 0 1024 1024"
                  className="relative z-20"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M858.5 933.3h-24v-16h16v3.9h8v12.1z m-40 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0H165v-18.5h16v10.5h-2.5v8z m680-28.1h-16v-16h16v16zM181 898.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 866.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 834.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 802.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 770.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 738.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 706.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 674.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 642.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 610.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 578.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 546.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 514.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 482.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 450.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 418.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 386.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 354.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 322.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 290.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 258.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 226.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 194.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 162.8h-16v-16h16v16z m677.5-25.6h-16v-16h16v16zM181 130.8h-16v-16h16v16z m677.5-25.6h-16v-8.4h0.4v-8h15.6v16.4z m-31.6-0.5h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0h-16v-16h16v16z m-32 0H173v-5.9h-8V88.7h21.9v16z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M261.7 193.2h500.2v228.9H261.7z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M769.8 430.2H253.7v-245h516.2v245z m-500.1-16h484.2v-213H269.7v213z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M261.7 496.3h112.4v129.4H261.7z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M382.1 633.7H253.7V488.3h128.4v145.4z m-112.4-16h96.4V504.3h-96.4v113.4z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M455.5 496.3h112.4v129.4H455.5z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M576 633.7H447.5V488.3H576v145.4z m-112.5-16H560V504.3h-96.4v113.4z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M261.7 709.9h112.4v129.4H261.7z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M382.1 847.3H253.7V701.9h128.4v145.4z m-112.4-16h96.4V717.9h-96.4v113.4z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M455.5 709.9h112.4v129.4H455.5z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M576 847.3H447.5V701.9H576v145.4z m-112.5-16H560V717.9h-96.4v113.4z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M649.4 496.3h112.4v342.9H649.4z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M769.8 847.3H641.4v-359h128.4v359z m-112.4-16h96.4v-327h-96.4v327zM261.7 256.3h78.5v16h-78.5zM261.7 333h139.7v16H261.7z"
                      fill="#f7f7f7"
                    ></path>
                    <path d="M147.3 71h51.4v51.4h-51.4z" fill="#ffffff"></path>
                    <path
                      d="M206.7 130.5h-67.4V63h67.4v67.5z m-51.4-16h35.4V79h-35.4v35.5z"
                      fill="#f7f7f7"
                    ></path>
                    <path d="M824.8 71h51.4v51.4h-51.4z" fill="#ffffff"></path>
                    <path
                      d="M884.2 130.5h-67.4V63h67.4v67.5z m-51.4-16h35.4V79h-35.4v35.5z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M147.3 899.6h51.4V951h-51.4z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M206.7 959h-67.4v-67.4h67.4V959z m-51.4-16h35.4v-35.4h-35.4V943z"
                      fill="#f7f7f7"
                    ></path>
                    <path
                      d="M824.8 899.6h51.4V951h-51.4z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M884.2 959h-67.4v-67.4h67.4V959z m-51.4-16h35.4v-35.4h-35.4V943z"
                      fill="#f7f7f7"
                    ></path>
                  </g>
                </svg>
                <p className="text-neutral-300 relative z-20 text-sm">
                  Clean, organized reports with proper headings and credible
                  source citations.
                </p>
              </CardSpotlight>
              <CardSpotlight className="h-56 w-56">
                <svg
                  width="54px"
                  height="54px"
                  viewBox="0 0 1024 1024"
                  className="relative z-20"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M510 508.4m-210.8 0a210.8 210.8 0 1 0 421.6 0 210.8 210.8 0 1 0-421.6 0Z"
                      fill="#454545"
                    ></path>
                    <path
                      d="M510 363.4c-80 0-145 65.1-145 145s65.1 145 145 145 145-65.1 145-145-65-145-145-145z"
                      fill="#b5b5b5"
                    ></path>
                    <path
                      d="M510 343.4c-91 0-165 74-165 165s74 165 165 165 165-74 165-165-74-165-165-165z m0 310.1c-80 0-145-65.1-145-145s65.1-145 145-145 145 65.1 145 145-65 145-145 145z"
                      fill="#454545"
                    ></path>
                    <path
                      d="M795.4 488.4H760c-4.7-59.5-30-114.7-72.7-157.4s-98.1-68.1-157.7-72.7v-36.6c0-11-9-20-20-20s-20 9-20 20v36.7c-59.3 4.7-114.5 30.1-157 72.6-42.6 42.6-68 97.9-72.7 157.4H226c-11 0-20 9-20 20s9 20 20 20h34c4.7 59.5 30 114.7 72.7 157.4 42.5 42.5 97.7 67.9 157 72.6v35.5c0 11 9 20 20 20s20-9 20-20v-35.4c59.6-4.6 115-30 157.7-72.7 42.6-42.6 68-97.9 72.7-157.4h35.4c11 0 20-9 20-20s-9-20-20.1-20zM529.7 718.3v-51.9c0-11-9-20-20-20s-20 9-20 20v51.8c-100.1-9.6-180-89.6-189.5-189.8h52.6c11 0 20-9 20-20s-9-20-20-20h-52.6c9.5-100.2 89.4-180.2 189.5-189.8v50.3c0 11 9 20 20 20s20-9 20-20v-50.3c100.5 9.3 180.7 89.5 190.2 189.9h-49.5c-11 0-20 9-20 20s9 20 20 20h49.5c-9.5 100.4-89.8 180.5-190.2 189.8z"
                      fill="#ffffff"
                    ></path>
                    <path
                      d="M880.4 158c0-11-9-20-20-20H510c-50 0-98.5 9.8-144.2 29.1-44.1 18.7-83.7 45.4-117.7 79.4-34 34-60.7 73.6-79.4 117.7-19.3 45.7-29.1 94.2-29.1 144.2 0 11 9 20 20 20s20-9 20-20C179.6 326.2 327.8 178 510 178h281.3v54.5c0 8.9 10.7 13.3 17 7l67.1-67.1c1.6-1.6 2.5-3.4 2.8-5.3 1.4-2.7 2.2-5.8 2.2-9.1zM860.4 488.4c-11 0-20 9-20 20 0 182.2-148.2 330.4-330.4 330.4H230.3V783c0-8.9-10.7-13.3-17-7l-67.1 67.1c-1 1-1.8 2.2-2.3 3.4-2.7 3.4-4.3 7.7-4.3 12.4 0 11 9 20 20 20H510c50 0 98.5-9.8 144.2-29.1 44.1-18.7 83.7-45.4 117.7-79.4 34-34 60.7-73.6 79.4-117.7 19.3-45.7 29.1-94.2 29.1-144.2 0-11.1-8.9-20.1-20-20.1z"
                      fill="#ffffff"
                    ></path>
                  </g>
                </svg>
                <p className="text-neutral-300 relative z-20 text-sm">
                  Watch your research develop in real-time with step-by-step
                  visual progress updates.
                </p>
              </CardSpotlight>
              <CardSpotlight className="h-56 w-56">
                <div>
                  <svg
                    width="54px"
                    height="54px"
                    viewBox="0 0 1024 1024"
                    className="relative z-20"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#ffffff"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M512 512m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z"
                        fill="#ffffff"
                      ></path>
                      <path
                        d="M512 306.8c27.7 0 54.6 5.4 79.8 16.1 24.4 10.3 46.4 25.1 65.2 44s33.6 40.8 44 65.2c10.7 25.3 16.1 52.1 16.1 79.8 0 27.7-5.4 54.6-16.1 79.8-10.3 24.4-25.1 46.4-44 65.2-18.8 18.8-40.8 33.6-65.2 44-25.3 10.7-52.1 16.1-79.8 16.1-27.7 0-54.6-5.4-79.8-16.1-24.4-10.3-46.4-25.1-65.2-44-18.8-18.8-33.6-40.8-44-65.2-10.7-25.3-16.1-52.1-16.1-79.8 0-27.7 5.4-54.6 16.1-79.8 10.3-24.4 25.1-46.4 44-65.2s40.8-33.6 65.2-44c25.2-10.6 52.1-16.1 79.8-16.1m0-22c-125.4 0-227.1 101.7-227.1 227.1S386.6 739.1 512 739.1c125.4 0 227.1-101.7 227.1-227.1S637.4 284.8 512 284.8z"
                        fill="#ffffff"
                      ></path>
                      <path
                        d="M512 618.7c-58.9 0-106.8-47.9-106.8-106.8S453.1 405.1 512 405.1 618.8 453 618.8 511.9 570.9 618.7 512 618.7z m0-193.5c-47.9 0-86.8 38.9-86.8 86.8s38.9 86.8 86.8 86.8 86.8-38.9 86.8-86.8-38.9-86.8-86.8-86.8z"
                        fill="#ffffff"
                      ></path>
                      <path
                        d="M544.2 107.3l34.1 92.3 7.4 19.9 20.2 6.6c10.3 3.4 32.1 12.9 43.4 18.1l18.7 8.6 18.6-8.9 87.9-41.8 46.4 46.5-41.2 89.4-8.9 19.3 9.6 19c6.8 13.4 12.6 27.5 17.4 41.9l6.7 20.5 20.3 7.2 91.7 32.6v65.7l-92.3 34.1-19.9 7.4-6.6 20.2c-4.7 14.4-10.6 28.4-17.4 41.9l-9.8 19.3 9.3 19.5 41.8 87.9-46.5 46.5-89.1-41.3-19.3-8.9-19 9.6c-13.4 6.8-27.5 12.6-41.9 17.4l-20.5 6.7-7.2 20.3-32.6 91.7h-65.7l-34.1-92.3-7.4-19.9-20.2-6.6c-10.3-3.4-32.1-12.9-43.4-18.1L356 771l-18.6 8.9-87.9 41.8-46.4-46.5 41.2-89.3 8.9-19.3-9.6-19c-6.8-13.4-12.6-27.5-17.4-41.9l-6.7-20.5-20.3-7.2-91.7-32.6v-65.7l92.3-34.1 19.9-7.4 6.6-20.2c3.4-10.3 12.9-32.1 18.1-43.4l8.6-18.7-8.9-18.6-41.8-87.9 46.4-46.4 89.3 41.2 19.3 8.9 19-9.6c13.4-6.8 27.5-12.6 41.9-17.4l20.5-6.7 7.2-20.3 32.6-91.7h65.7m30.7-44.1H447.4l-43 121c-16.6 5.5-32.7 12.1-48.1 19.9l-117.2-54-90.1 90.1 55.2 116s-14.5 31.4-19.9 48.1l-121 44.7v127.4l121 43c5.5 16.6 12.1 32.6 19.9 48l-54 117.2 90.1 90.1 116-55.2s31.4 14.5 48.1 19.9l44.7 121h127.4l43-121c16.6-5.5 32.6-12.1 48-19.9l117.2 54 90.1-90.1-55.2-116c7.8-15.4 14.5-31.4 19.9-48l121-44.7V447.4l-121-43c-5.5-16.6-12.1-32.6-19.9-48l54-117.2-90.1-90.1-115.9 55.2s-31.5-14.5-48.1-19.9L574.9 63.3z"
                        fill="#ffffff"
                      ></path>
                    </g>
                  </svg>
                </div>
                <p className="text-neutral-300 relative z-20 text-sm">
                  Transforms raw information from trusted sources into coherent,
                  easy-to-understand content.
                </p>
              </CardSpotlight>
            </div>
          </section>
        )}
        {isLoading && (
          <section className="mb-8 animate-fade-in">
            <div className="p-6 bg-black rounded-xl shadow-sm border-b-2 border-white dark:border-white">
              <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-600 dark:to-white text-2xl mb-4 flex items-center gap-2">
                <span className="animate-pulse rounded-full h-3 w-3 bg-white"></span>
                Research in Progress
              </h2>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-white dark:text-white mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-200 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Processing time: {processingTime}s
                </p>
              </div>

              <div className="py-4 px-5 bg-gray-50 dark:bg-gray-950 rounded-lg mb-6">
                <h3 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 dark:from-neutral-200 dark:to-white text-sm mb-2">
                  Current Task:
                </h3>
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  {thoughtStages[currentStage].text}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {thoughtStages[currentStage].details}
                </p>
              </div>

              <div className="py-4 px-5 bg-gray-50 dark:bg-gray-950 rounded-lg mb-6">
                <h3 className="text-sm bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600 dark:from-neutral-200 dark:to-white mb-2">
                  Research Process:
                </h3>
                <div
                  className={`${geistMono.className} text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line`}
                >
                  {thoughtStages.map((stage, index) => (
                    <div
                      key={index}
                      className={`mb-3 flex items-start gap-2 ${
                        index > currentStage ? "opacity-40" : ""
                      }`}
                    >
                      <span
                        className={
                          index === currentStage
                            ? "text-white font-bold mt-0.5"
                            : "mt-0.5"
                        }
                      >
                        {index <= currentStage ? "✓" : "○"}
                      </span>
                      <div>
                        <div
                          className={
                            index === currentStage ? "text-white font-bold" : ""
                          }
                        >
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
                  <p>
                    Thank you for your patience. Complex research topics may
                    take a few minutes to process.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {error && (
          <section className="mb-8 animate-fade-in">
            <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl">
              <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                Error
              </h2>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">
                  Troubleshooting Tips:
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc pl-5 space-y-1">
                  <li>Check your internet connection</li>
                  <li>
                    The server might be experiencing high load, try again in a
                    few minutes
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {report && (
          <section className="animate-fade-in">
            <div className="p-6 bg-black rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
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
                    h1: ({ ...props }) => (
                      <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
                    ),
                    h2: ({ ...props }) => (
                      <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
                    ),
                    h3: ({ ...props }) => (
                      <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
                    ),
                    p: ({ ...props }) => <p className="my-3" {...props} />,
                    a: ({ ...props }) => (
                      <a
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                        {...props}
                      />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc pl-6 my-3" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal pl-6 my-3" {...props} />
                    ),
                    li: ({ ...props }) => <li className="my-1" {...props} />,
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
                        {...props}
                      />
                    ),
                    // code: ({inline, ...props}: any) => (
                    //   inline
                    //     ? <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                    //     : <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto" {...props} />
                    // ),
                    table: ({ ...props }) => (
                      <div className="overflow-x-auto my-6">
                        <table
                          className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ ...props }) => (
                      <thead
                        className="bg-gray-100 dark:bg-gray-800"
                        {...props}
                      />
                    ),
                    th: ({ ...props }) => (
                      <th
                        className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white"
                        {...props}
                      />
                    ),
                    td: ({ ...props }) => (
                      <td
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800"
                        {...props}
                      />
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

        {/* <section className="relative z-10">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
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
              className="px-6 py-3 bg-black hover:bg-white hover:text-black border-2 border-white text-white rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 min-w-40"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Researching...
                </>
              ) : (
                "Generate Report"
              )}
            </button>
          </form>
        </section> */}
        {!isLoading && !report && !error && (
          <div>
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setTopic(e.target.value)}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </main>
      <div className="inset-0 z-0">
        <BackgroundBeams />
      </div>
    </div>
  );
}
