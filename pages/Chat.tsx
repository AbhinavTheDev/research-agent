import { /*useRef,*/ useState, useEffect, Fragment, memo, lazy } from "react";
import {
  type PromptInputMessage,
  PromptInput,
} from "@/components/elements/prompt-input.tsx";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/elements/conversation.tsx";
import {
  Message,
  MessageContent,
  MessageAction,
  MessageActions,
  MessageAttachments,
  MessageAttachment,
  MessageResponse,
} from "@/components/elements/message.tsx";
const SearchProcess = lazy(() =>
  import("@/components/elements/search-process.tsx").then((module) => ({
    default: module.SearchProcess,
  })),
);
const RetrieveProcess = lazy(() =>
  import("@/components/elements/search-process.tsx").then((module) => ({
    default: module.RetrieveProcess,
  })),
);
const AcademicSearchProcess = lazy(() =>
  import("@/components/elements/AcademicSearch.tsx").then((module) => ({
    default: module.AcademicSearchProcess,
  })),
);
import { RefreshCcwIcon, CopyIcon } from "lucide-react";
import { CheckIcon } from "@phosphor-icons/react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils.ts";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/elements/reasoning.tsx";
import { TextLoopLoader } from "@/components/elements/loader.tsx";
import { useChatStore } from "@/utils/store.ts";
import { useMockChat } from "@/test/mockChat";

const SourcesSidebar = lazy(() =>
  import("@/components/elements/search-process.tsx").then((module) => ({
    default: module.SourcesSidebar,
  })),
);
const AcademicSidebar = lazy(() =>
  import("@/components/elements/AcademicSearch.tsx").then((module) => ({
    default: module.AcademicSidebar,
  })),
);

const ChatPage = memo(function Chat({
  className,
  onMessagesChange,
  onStatusChange,
}: {
  className?: string;
  onMessagesChange?: (messages: any[]) => void;
  onStatusChange?: (status: string) => void;
}) {
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sidebarSources, setSidebarSources] = useState<any[] | null>(null);
  const [academicPapers, setAcademicPapers] = useState<any[] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAcademicSidebarOpen, setIsAcademicSidebarOpen] = useState(false);
  const model = useChatStore((state) => state.model);
  const webSearch = useChatStore((state) => state.webSearch);
  const doAcademicSearch = useChatStore((state) => state.academicSearch);
  const provider = useChatStore((state) => state.provider);

  const handleViewSources = (sources: any[]) => {
    setSidebarSources(sources);
    setIsSidebarOpen(true);
  };

  const handleViewPapers = (papers: any[]) => {
    setAcademicPapers(papers);
    setIsAcademicSidebarOpen(true);
  };

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000); 
  };

  const mockChat = useMockChat();
  const realChat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const { messages, sendMessage, status, regenerate, stop, error } = realChat;

  // useEffect(() => console.log("Status:", status), [status]);
  // useEffect(
  //   () =>
  //     console.log(
  //       "Messages length:",
  //       messages.length,
  //       "Last message parts:",
  //       messages[messages.length - 1]?.parts
  //     ),
  //   [messages]
  // );

  // Notify parent of changes
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    if (!hasAttachments) {
      sendMessage(
        {
          text: message.text,
        },
        {
          body: {
            model: model.id,
            provider: provider,
            webSearch: webSearch,
            doAcademicSearch: doAcademicSearch,
          },
        },
      );
    } else {
      sendMessage(
        {
          text: message.text,
          files: message.files,
        },
        {
          body: {
            model: model.id,
            provider: provider,
            webSearch: webSearch,
            doAcademicSearch: doAcademicSearch,
          },
        },
      );
    }
    setInput("");
  };
  // console.log(webSearch);
  return (
    <div
      className={cn(
        "font-sans mx-auto max-w-4xl px-2 h-[92vh] md:h-screen flex flex-col z-10",
        className,
      )}
    >
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center w-full z-10">
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div className="text-center m-0 mb-2">
              <div className="inline-flex items-center gap-3">
                <h1 className="text-4xl sm:text-5xl mb-0! text-foreground dark:text-foreground font-sans! font-light tracking-tighter">
                  element
                </h1>
              </div>
            </div>
            <PromptInput
              className="w-full"
              onSubmit={handleSubmit}
              stopFn={stop}
            />
          </div>
          {/* <div className="pt-15">
            <Shimmer>
              <span className="tracking-tighter text-7xl sm:text-8xl md:text-[10rem] font-sans font-semibold">mira v0</span>
            </Shimmer>
          </div> */}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 overflow-hidden">
          <Conversation className="z-10 w-full flex-1 max-w-full overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-0 mb-4">
            <ConversationContent>
              {messages.map((message) => (
                <Fragment key={message.id}>
                  <MessageAttachments className="mb-2">
                    {message.parts.map((part: any) =>
                      part.type === "file" ? (
                        <MessageAttachment data={part} key={part.url} />
                      ) : null,
                    )}
                  </MessageAttachments>

                  {message.parts.map((part, i) => {
                    if (
                      status === "streaming" &&
                      message.id === messages.at(-1)?.id &&
                      i === message.parts.length - 1 &&
                      ((part.type === "text" && !part.text) ||
                        ![
                          "text",
                          "reasoning",
                          "tool-web_search",
                          "tool-retrieve_web_page",
                        ].includes(part.type))
                    ) {
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent key={`${message.id}-${i}`}>
                              <TextLoopLoader />
                            </MessageContent>
                          </Message>
                        </Fragment>
                      );
                    }

                    switch (part.type) {
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent status={status}>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      case "text":
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              <MessageContent key={`${message.id}-${i}`}>
                                <MessageResponse
                                  key={`${message.id}-${i}`}
                                  status={status}
                                  className={cn(
                                    "whitespace-pre-wrap wrap-break-word backdrop-blur-sm",
                                  )}
                                >
                                  {part.text}
                                </MessageResponse>
                              </MessageContent>
                            </Message>
                            {/* {message.role === "user" && (
                              <MessageActions className="justify-end m-0">
                                <MessageAction
                                  onClick={() => {
                                    handleCopy(part.text, message.id); // Copy only the cleaned text
                                  }}
                                  label="Copy"
                                  tooltip="Copy"
                                >
                                  {copiedMessageId === message.id ? (
                                    <CheckIcon className="size-3" />
                                  ) : (
                                    <CopyIcon className="size-3" />
                                  )}
                                </MessageAction>
                              </MessageActions>
                            )} */}
                            {message.role === "assistant" &&
                              part.state === "done" && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() =>
                                      regenerate({
                                        messageId: message.id,
                                        body: {
                                          model: model.id,
                                          provider: provider,
                                          webSearch: webSearch,
                                          doAcademicSearch: doAcademicSearch,
                                        },
                                      })
                                    }
                                    tooltip="Rerun"
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() => {
                                      handleCopy(part.text, message.id); 
                                    }}
                                    label="Copy"
                                    tooltip="Copy"
                                  >
                                    {copiedMessageId === message.id ? (
                                      <CheckIcon className="size-3" />
                                    ) : (
                                      <CopyIcon className="size-3" />
                                    )}
                                  </MessageAction>
                                </MessageActions>
                              )}
                          </Fragment>
                        );
                      case "tool-web_search":
                        return (
                          <SearchProcess
                            key={`${message.id}-${i}`}
                            toolPart={part}
                            onViewSources={handleViewSources}
                          />
                        );
                      case "tool-retrieve_web_page":
                        return (
                          <RetrieveProcess
                            key={`${message.id}-${i}`}
                            toolPart={part}
                          />
                        );
                      case "tool-academic_search":
                        return (
                          <AcademicSearchProcess
                            key={`${message.id}-${i}`}
                            toolPart={part}
                            onViewPapers={handleViewPapers}
                          />
                        );
                      default:
                        return null;
                    }
                  })}
                </Fragment>
              ))}

              {/* Display Error Message in Messages UI */}
              {error && (
                <Fragment>
                  <Message from="assistant">
                    <MessageContent>
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg">
                        <p className="font-bold">An error occurred</p>
                        <p className="text-sm">{error.message}</p>
                      </div>
                    </MessageContent>
                  </Message>
                  <MessageActions>
                    <MessageAction
                      label="Retry"
                      onClick={() =>
                        regenerate({
                          body: {
                            model: model.id,
                            provider: provider,
                            webSearch: webSearch,
                            doAcademicSearch: doAcademicSearch,
                          },
                        })
                      }
                      tooltip="Rerun"
                    >
                      <RefreshCcwIcon className="size-4" />
                    </MessageAction>
                  </MessageActions>
                </Fragment>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <PromptInput
            className="relative bottom-6 w-full z-10"
            onSubmit={handleSubmit}
            status={status}
            stopFn={stop}
          />
        </div>
      )}
      <SourcesSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sources={sidebarSources || []}
      />
      <AcademicSidebar
        isOpen={isAcademicSidebarOpen}
        onClose={() => setIsAcademicSidebarOpen(false)}
        papers={academicPapers || []}
      />
    </div>
  );
});

export { ChatPage };
