import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, useRef, useEffect } from "react";
import { youtubeStreamFn } from "./api/-youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/elements/loader";
import { cn } from "@/lib/utils";
import { ArrowUp, X, Copy, Check } from "lucide-react";
import { YoutubeLogoIcon } from "@phosphor-icons/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Image } from "@unpic/react";

export const Route = createFileRoute("/youtube")({
  component: YouTubePage,
});

function YouTubePage() {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [messages, setMessages] = useState("");

  // Uncomment for testing UI
//   useEffect(() => {
//     setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
//     setLastPrompt("Summarize this video.");
//     setMessages(
//       "This is a sample response for testing purposes:\n\n1. Introduction to the topic.\n2. Detailed analysis of the key points.\n3. Conclusion and takeaways.This is a sample response for testing purposes:",
//     );
//   }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [copied, setCopied] = useState(false); // New state for copy feedback
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && (isLoading || messages)) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const getYoutubeShortId = (url: string): string | null => {
    const regExp = /youtube\.com\/shorts\/([^#&?]*)/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const videoId = getYouTubeId(url) || getYoutubeShortId(url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  const handleSubmit = useCallback(async () => {
    if (!prompt || !url || isLoading) return;

    setIsLoading(true);
    setMessages("");
    setLastPrompt(prompt); // Persist question for display
    setPrompt(""); // Clear input

    try {
      const stream = (await youtubeStreamFn({
        data: { prompt, url },
      })) as AsyncIterable<string>;
      for await (const chunk of stream) {
        setMessages((prev) => prev + chunk);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(
        "Error occurred while streaming response: " + (error as Error).message,
      );
    } finally {
      setIsLoading(false);
    }
  }, [prompt, url, isLoading]);

  const clearUrl = () => {
    setUrl("");
    setMessages("");
    setLastPrompt("");
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopy = () => {
    if (!messages) return;
    navigator.clipboard.writeText(messages);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnalysis = Boolean(messages || isLoading);

  return (
    <div className="flex flex-col min-h-[93vh] md:h-screen max-w-4xl mx-auto font-sans selection:bg-primary/20 relative">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0 px-4 w-full">
        <div className="flex flex-col justify-end min-h-full pt-6 md:pt-4">
          {/* Empty State / Hero */}
          {!hasAnalysis && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in duration-500 relative">
              {/* Removed the old static simple gradient, relying on the new global grid/orb above */}

              <div className="relative group mb-8">
                <div className="absolute -inset-8 bg-gradient-to-tr from-red-600/10 via-primary/10 to-red-600/10 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition duration-1000" />
                <div className="relative flex items-center -space-x-5">
                  <div className="z-20 p-4 rounded-[2rem] bg-background border border-border/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group-hover:-translate-y-1 group-hover:-rotate-3">
                    <Image
                      src="./assets/logo/element-logo.svg"
                      alt="Element"
                      width={44}
                      height={44}
                      className="w-11 h-11"
                    />
                  </div>
                  <div className="z-10 p-4 rounded-[2rem] bg-background/60 backdrop-blur-md border border-border/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] translate-y-6 transition-all duration-500 group-hover:translate-y-5 group-hover:rotate-3">
                    <YoutubeLogoIcon
                      weight="fill"
                      className="w-11 h-11 text-[#FF0000] drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 max-w-lg">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  youtube <em>element</em>
                </h1>
                <p className="text-muted-foreground/70 text-lg max-w-md mx-auto leading-relaxed">
                  Turn hours of video into seconds of clarity.{" "}
                  <br className="hidden sm:block" />
                  Paste a link to chat with any YouTube content.
                </p>
              </div>

              {/* Enhancement: Quick Suggestion Chips */}
              {videoId && (
                <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-4 sm:mt-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
                  {[
                    "Summarize this video",
                    "What are the key takeaways?",
                    "Explain the main technical concepts",
                    "Analyze the speaker's arguments",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-xs sm:text-sm px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/40 hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all text-left truncate"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analysis Content */}
          {hasAnalysis && (
            <div className="w-full flex flex-col gap-2 overflow-y-auto h-[70vh] overflow-x-hidden [&::-webkit-scrollbar]:w-0">
              {/* User Question Bubble */}
              <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="bg-muted/50 text-foreground px-5 py-3.5 rounded-3xl rounded-br-sm max-w-[85%] sm:max-w-[75%] border border-border/50">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {lastPrompt}
                  </p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4 items-start animate-in slide-in-from-bottom-2 fade-in duration-500 delay-100 group/response">
                <div className="flex-1 space-y-4 min-w-0 relative">
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none 
                    prose-headings:font-medium prose-headings:text-foreground
                    prose-p:leading-relaxed prose-p:text-muted-foreground
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-ul:my-4 prose-li:my-1
                    prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/40 prose-pre:rounded-xl
                  "
                  >
                    {messages ? (
                      <div className="whitespace-pre-wrap break-words">
                        {messages}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 pt-2">
                        <span className="h-4 w-1/3 bg-muted/40 animate-pulse rounded" />
                        <span className="h-4 w-2/3 bg-muted/40 animate-pulse rounded delay-75" />
                      </div>
                    )}
                  </div>

                  {/* Enhancement: Copy Button */}
                  {!isLoading && messages && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-background/80 backdrop-blur border border-border/50 text-muted-foreground group-hover/response:opacity-100 transition-all duration-200 hover:text-foreground hover:bg-muted shadow-sm"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <div className="flex gap-2 items-center">
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs hidden md:block">Copied</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs hidden md:block">Copy</span>
                        </div>
                      )}
                    </button>
                  )}

                  {/* Streaming indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Analyzing video content...
                    </div>
                  )}
                </div>
              </div>

              <div ref={scrollRef} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Input Area at Bottom */}
      <div className="w-full px-4 pb-6 pt-2 z-10">
        {/* --- MODIFIED: Reactive Input "Core" --- */}
        {/* The container now reacts to the `isLoading` state with a subtle shadow pulse */}
        <div
          className={cn(
            "relative flex flex-col gap-2 rounded-2xl p-2 ring-offset-background transition-all duration-500 ease-in-out",
            // Default State:
            "bg-muted/30 border border-border/50 hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring/20",
            // Loading State: Adds a subtle 'thinking' aura
            isLoading &&
              "bg-background/80 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)] border-red-500/20",
          )}
        >
          {/* Top Row: Thumbnail Pill OR URL Input */}
          <div className="flex items-center gap-2 px-2 pt-1">
            {thumbnailUrl ? (
              <HoverCard key={videoId}>
                <HoverCardTrigger asChild>
                  <div className="group relative flex items-center gap-3 bg-background/50 rounded-lg p-1.5 pr-3 border border-border/50 transition-all hover:bg-background/80">
                    <div className="relative h-8 w-12 rounded overflow-hidden shrink-0 bg-muted">
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground max-w-[200px] truncate">
                      Video ID: {videoId}
                    </span>
                    <button
                      onClick={clearUrl}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  className="w-90 p-0 overflow-hidden border-border/50 shadow-xl"
                  side="top"
                  align="start"
                >
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}?&controls=1&fs=0`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="p-3 bg-background">
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <YoutubeLogoIcon className="w-3 h-3" />
                      Added Video
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <div className="flex-1 flex items-center gap-2 text-muted-foreground px-1">
                <YoutubeLogoIcon
                  weight="fill"
                  className="w-4 h-4 shrink-0 transition-colors"
                />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube Link..."
                  className="h-7 border-0 p-0 bg-transparent shadow-none focus-visible:ring-0 text-xs sm:text-sm placeholder:text-muted-foreground/50"
                />
              </div>
            )}
          </div>

          {/* Bottom Row: Text Input & Action Button */}
          <div className="relative flex items-end gap-2 px-2 pb-1">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                thumbnailUrl ? "Ask about this video..." : "Enter URL first..."
              }
              disabled={!thumbnailUrl && !url} // Encourages URL entry, but allows typing if URL exists
              className="min-h-[44px] w-full resize-none border-0 p-2 text-sm shadow-none focus-visible:ring-0 disabled:opacity-50 placeholder:text-muted-foreground/50"
              rows={1}
            />
            <Button
              size="icon"
              className={cn(
                "mb-0.5 h-8 w-8 rounded-xl shrink-0 transition-all duration-200",
                prompt && videoId ? "opacity-100" : "opacity-30",
              )}
              disabled={!prompt || !videoId || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? <Loader /> : <ArrowUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="text-center mt-2">
          <p className="text-[10px] text-muted-foreground/40 font-medium tracking-tight">
            AI can make mistakes. Check video source.
          </p>
        </div>
      </div>
    </div>
  );
}
