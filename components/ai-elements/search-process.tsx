import {
  ArrowUpRightFromSquareIcon,
  ChevronRight,
  InfoIcon,
  XIcon,
} from "lucide-react";
import type { ToolUIPart } from "ai";
import { Shimmer } from "./shimmer";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Alert } from "../ui/alert";
import { useIsMobile } from "hooks/use-mobile";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";

type SearchResult = {
  title: string;
  url: string;
  content: string;
};

type SourcesSidebarProps = {
  sources: SearchResult[];
  isOpen: boolean;
  onClose: () => void;
};

const SourceCard = ({
  result,
  index,
}: {
  result: SearchResult;
  index: number;
}) => {
  const { title, url, content } = result;
  const domain = new URL(url).hostname;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 group border border-accent m-2 rounded-lg hover:border-foreground/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-shrink-0 size-6 flex items-center justify-center bg-muted rounded-full text-xs">
          {index + 1}
        </div>
        <p className="font-semibold text-sm truncate" title={title}>
          {title}
        </p>
        <ArrowUpRightFromSquareIcon className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
        <img
          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
            domain,
          )}`}
          alt="favicon"
          width={14}
          height={14}
          className="size-3.5 rounded-full"
        />
        <span>{domain}</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
    </a>
  );
};

export const SourcesSidebar = ({
  sources,
  isOpen,
  onClose,
}: SourcesSidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Overlay only when open */}
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-black/50" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full bg-card border-l flex flex-col rounded-lg transition-transform duration-300 z-20 ${
          isMobile ? "w-full" : "md:w-1/3 lg:w-1/4"
        } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold">Sources</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          {sources.map((result, index) => (
            <SourceCard key={result.url} result={result} index={index} />
          ))}
        </div>
      </div>
    </>
  );
};

type SearchProcessProps = {
  toolPart: ToolUIPart;
  onViewSources: (sources: any[]) => void;
};

export function SearchProcess({ toolPart, onViewSources }: SearchProcessProps) {
  const { state, output } = toolPart;

  if (state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 mb-2 w-fit text-sm text-muted-foreground">
        <Shimmer>Searching the web...</Shimmer>
      </div>
    );
  }

  if (state === "output-available" && output?.results) {
    return (
      <button
        onClick={() => onViewSources(output.results)}
        className="flex items-center gap-2 text-sm px-2 py-2 mb-2 rounded-full w-fit hover:bg-accent/30"
      >
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
          {output?.results
            .slice(0, 5)
            .map((item: SearchResult, index: number) => (
              <Avatar className="size-5" key={index}>
                <AvatarImage
                  src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
                    item.url,
                  )}`}
                  alt={item.url}
                />
                <AvatarFallback>{item.title}</AvatarFallback>
              </Avatar>
            ))}
        </div>
        <div className="flex items-center gap-1">
          <span>View {output.results.length} sources</span>
          <ChevronRight className="size-4" />
        </div>
      </button>
    );
  }

  if (state === "output-error" || state === "output-denied") {
    return (
      <div className="flex flex-col gap-2 items-start text-sm mb-2">
        {toolPart.errorText && (
          <div className="flex items-start justify-center w-full">
            <Alert
              className="gap-4 items-center"
              hideIconWrapper
              variant="faded"
              color="danger"
              title="Error searching the web."
              description={toolPart.errorText}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}

type RetrieveProcessProps = {
  toolPart: ToolUIPart;
};

export function RetrieveProcess({ toolPart }: RetrieveProcessProps) {
  const { state, output } = toolPart;
  const nav = useNavigate();

  if (state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
        <Shimmer>Analyzing given URLs...</Shimmer>
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="flex items-center gap-2 mb-2">
        <CheckCircleIcon className="text-lg text-green-500" />
        <span className="flex gap-2 text-sm text-muted-foreground">
          Analyzed Given URL{" "}
          <div className="flex gap-2 flex-wrap">
            {output?.results.map((item: any, index: number) => (
              <Link
                href={item.url}
                reloadDocument={true}
                className="bg-accent hover:bg-accent/80 text-accent-foreground px-3 rounded-full text-sm font-medium transition-colors duration-200"
              >
                {index}
              </Link>
            ))}
          </div>
        </span>
      </div>
    );
  }

  // For other states (e.g., error), you could add more handling if needed
  return null;
}
