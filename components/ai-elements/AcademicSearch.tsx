import {
  ArrowUpRightFromSquareIcon,
  ChevronRight,
  XIcon,
  BookOpenIcon,
} from "lucide-react";
import type { ToolUIPart } from "ai";
import { Shimmer } from "./shimmer";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Alert } from "../ui/alert";
import { useIsMobile } from "hooks/use-mobile";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Badge } from "../ui/badge";

export type AcademicPaper = {
  id: string;
  doi?: string;
  title: string;
  abstract: string;
  publication_year?: number;
  cited_by_count?: number;
  open_access?: { is_oa: boolean };
  primary_location?: {
    landing_page_url?: string;
    source?: {
      display_name?: string;
    };
  };
  authorships?: Array<{
    author: string;
  }>;
  keywords?: string[];
  pdfUrl?: string;
};

type AcademicSidebarProps = {
  papers: AcademicPaper[];
  isOpen: boolean;
  onClose: () => void;
};

const PaperCard = ({
  paper,
  index,
}: {
  paper: AcademicPaper;
  index: number;
}) => {
  const {
    title,
    abstract,
    publication_year,
    cited_by_count,
    authorships,
    keywords,
    pdfUrl,
    primary_location,
    open_access,
  } = paper;
  const url =
    pdfUrl ||
    primary_location?.landing_page_url ||
    `https://openalex.org/${paper.id}`;
  const authors = authorships
    ?.slice(0, 3)
    .map((a) => a.author)
    .join(", ");
  const hasMoreAuthors = authorships && authorships.length > 3;

  return (
    <div className="block p-4 border border-accent m-2 rounded-lg hover:border-foreground/30 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 size-6 flex items-center justify-center bg-primary/10 rounded-full text-sm font-semibold text-primary">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2 mb-1"
            title={title}
          >
            {title}
          </a>
          {authors && (
            <p className="text-xs text-muted-foreground mb-1">
              {authors}
              {hasMoreAuthors && " et al."}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {publication_year && (
              <Badge variant="secondary" className="text-xs">
                {publication_year}
              </Badge>
            )}
            {cited_by_count !== undefined && (
              <Badge variant="outline" className="text-xs">
                {cited_by_count} citations
              </Badge>
            )}
            {open_access?.is_oa && (
              <Badge variant="default" className="text-xs bg-green-600">
                Open Access
              </Badge>
            )}
          </div>
        </div>
      </div>

      {abstract && (
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
          {abstract}
        </p>
      )}

      {keywords && keywords.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {keywords.slice(0, 5).map((keyword, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
            >
              {typeof keyword === "string"
                ? keyword
                : keyword?.display_name || "Unknown"}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <BookOpenIcon className="size-3" />
            PDF
          </a>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View Paper
          <ArrowUpRightFromSquareIcon className="size-3" />
        </a>
      </div>
    </div>
  );
};

export const AcademicSidebar = ({
  papers,
  isOpen,
  onClose,
}: AcademicSidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Overlay only when open */}
      {isOpen && (
        <div className="fixed inset-0 z-10 bg-black/50" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full bg-card border-l flex flex-col rounded-lg transition-transform duration-300 z-90 ${
          isMobile ? "w-full" : "md:w-1/2 lg:w-1/3"
        } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Academic Papers</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          {papers.map((paper, index) => (
            <PaperCard key={paper.id} paper={paper} index={index} />
          ))}
        </div>
      </div>
    </>
  );
};

type AcademicSearchProcessProps = {
  toolPart: ToolUIPart;
  onViewPapers: (papers: any[]) => void;
};

export function AcademicSearchProcess({
  toolPart,
  onViewPapers,
}: AcademicSearchProcessProps) {
  const { state, output } = toolPart;

  if (state === "input-streaming") {
    return (
      <div className="flex items-center gap-2 mb-2 w-fit text-sm text-muted-foreground">
        <Shimmer>Searching academic databases...</Shimmer>
      </div>
    );
  }

  if (state === "output-available" && output && Array.isArray(output)) {
    const papers = output;
    return (
      <button
        onClick={() => onViewPapers(papers)}
        className="flex items-center gap-2 text-sm px-2 py-2 mb-2 rounded-full w-fit hover:bg-accent/30"
      >
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
          {papers.slice(0, 5).map((paper: AcademicPaper, index: number) => {
            const iconUrl = paper.primary_location?.source?.display_name
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(paper.primary_location.source.display_name)}&background=random`
              : `https://ui-avatars.com/api/?name=Paper&background=random`;

            return (
              <Avatar className="size-5" key={index}>
                <AvatarImage src={iconUrl} alt={paper.title} />
                <AvatarFallback>{index + 1}</AvatarFallback>
              </Avatar>
            );
          })}
        </div>
        <div className="flex items-center gap-1">
          <span>View {papers.length} papers</span>
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
              title="Error searching academic databases."
              description={toolPart.errorText}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}
