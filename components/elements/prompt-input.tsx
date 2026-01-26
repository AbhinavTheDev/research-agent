// Global type declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

type SpeechRecognitionResultList = {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
};

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

import React, {
  useRef,
  useState,
  useEffect,
  type FormEvent,
  type ChangeEventHandler,
  useCallback,
} from "react";
import {
  ChevronDown,
  Paperclip,
  SendIcon,
  Globe,
  ImagePlusIcon,
  XIcon,
  PaperclipIcon,
  Check,
  CpuIcon,
} from "lucide-react";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
  Command,
} from "../ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Image } from "@unpic/react";
import { models, type ModelProps } from "ai/models";
import { Input } from "../ui/input.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.tsx";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card.tsx";
import { nanoid } from "nanoid";
import type { ChatStatus, FileUIPart } from "ai";
import {
  GraduationCapIcon,
  MicrophoneIcon,
  SquareIcon,
} from "@phosphor-icons/react";
import { useIsMobile } from "hooks/use-mobile.ts";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer.tsx";
import { useStore } from "@tanstack/react-store";
import { chatStore } from "@/utils/store.ts";
import { cn } from "@/lib/utils.ts";

// Minimal PromptInput component
export type PromptInputMessage = {
  text: string;
  files?: FileUIPart[];
};

export type PromptInputProps = {
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  status?: ChatStatus;
  stopFn: () => void;
  className?: string;
  placeholder?: string;
};

const convertBlobUrlToDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export function PromptInput({
  onSubmit,
  status,
  stopFn,
  className,
  placeholder = "Ask anything...",
}: PromptInputProps) {
  const [input, setInput] = useState("");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const search = useStore(chatStore, (state) => state.webSearch);
  const acadSearch = useStore(chatStore, (state) => state.academicSearch);
  const model = useStore(chatStore, (state) => state.model);
  const isMobile = useIsMobile();

  // State for managing attached files with blob URLs and IDs
  const [files, setFiles] = useState<(FileUIPart & { id: string })[]>([]);

  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const speechRecognition = new SpeechRecognition();

      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = "en-US";

      speechRecognition.onstart = () => {
        setIsListening(true);
      };

      speechRecognition.onend = () => {
        setIsListening(false);
      };

      speechRecognition.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0]?.transcript ?? "";
          }
        }

        if (finalTranscript) {
          setInput((prev) =>
            prev ? `${prev} ${finalTranscript}` : finalTranscript,
          );
        }
      };

      speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = speechRecognition;
      setRecognition(speechRecognition);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [textareaRef]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }, [recognition, isListening]);

  // Handle file attachment
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles: (FileUIPart & { id: string })[] = selectedFiles.map(
      (file) => ({
        id: nanoid(),
        type: "file" as const,
        url: URL.createObjectURL(file),
        mediaType: file.type,
        filename: file.name,
      }),
    );
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input to allow re-selecting the same file
    event.target.value = "";
  };

  // Remove a specific file
  const removeFile = (id: any) => {
    setFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.url) {
        URL.revokeObjectURL(found.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasText = Boolean(input.trim());
    const hasFiles = files.length > 0;
    if (!hasText && !hasFiles) return;

    // Convert blob URLs to data URLs before submit
    const convertedFiles = hasFiles
      ? await Promise.all(
          files.map(async ({ id, ...item }) => {
            if (item.url && item.url.startsWith("blob:")) {
              const dataUrl = await convertBlobUrlToDataUrl(item.url);
              // If conversion failed, keep the original blob URL
              return {
                ...item,
                url: dataUrl ?? item.url,
              };
            }
            return item;
          }),
        )
      : undefined;

    try {
      await onSubmit({ text: input, files: convertedFiles }, e);
      setInput("");
      files.forEach(({ url }) => URL.revokeObjectURL(url));
      setFiles([]);
    } catch {
      // keep state for retry
    }
  };
  const handleStop = async () => {
    stopFn();
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };
  const acadSearchHandler = (key: boolean) => {
    chatStore.setState((state) => {
      return {
        ...state,
        academicSearch: key,
      };
    });
  };

  const searchHandler = (key: boolean) => {
    chatStore.setState((state) => {
      return {
        ...state,
        webSearch: key,
      };
    });
  };

  const modelSelector = (key: ModelProps) => {
    chatStore.setState((state) => {
      return {
        ...state,
        model: {
          ...key,
          imageSupport: !!key.imageSupport,
          toolSupport: !!key.toolSupport,
        },
      };
    });
  };

  const setProvider = (key: string) => {
    chatStore.setState((state) => {
      return {
        ...state,
        provider: key,
      };
    });
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleGlobalKeyDown = (event: KeyboardEvent) => {
        const textarea = document.querySelector(
          "#textarea",
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          textarea.focus();
        }
      };
      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => {
        window.removeEventListener("keydown", handleGlobalKeyDown);
      };
    }
  }, []);

  return (
    <form
      ref={formRef}
      className={cn(
        `flex flex-col bg-background rounded-2xl`,
        files.length > 0 ? "border pb-1 px-1.5" : "",
        className,
      )}
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
    >
      {/* Display attached files if any */}
      {files.length > 0 && (
        <div className="transition duration-300 ease-in-out flex flex-row gap-2 overflow-x-auto p-2 max-h-28 z-10 [&::-webkit-scrollbar]:w-0 rounded-2xl">
          {files.map((file, index) => {
            const isImage = file.mediaType.startsWith("image/");
            const filename = file.filename;
            const attachmentLabel =
              filename || (isImage ? "Image" : "Attachment");

            return (
              <HoverCard key={file.id}>
                <HoverCardTrigger asChild>
                  <div className="group relative flex p-2 rounded-2xl cursor-pointer select-none items-center gap-1.5 rounded-2x border border-border font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50">
                    <div className="relative size-5 shrink-0">
                      <div className="absolute inset-0 flex size-5 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0">
                        {isImage ? (
                          <Image
                            alt={filename || "attachment"}
                            className="object-cover rounded-full"
                            height={60}
                            src={file.url}
                            width={60}
                          />
                        ) : (
                          <div className="flex size-5 items-center justify-center text-muted-foreground">
                            <PaperclipIcon className="size-3" />
                          </div>
                        )}
                      </div>
                      <Button
                        aria-label="Remove attachment"
                        className="absolute inset-0 size-5 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2.5"
                        onClick={() => removeFile(file.id)}
                        type="button"
                        variant="ghost"
                      >
                        <XIcon />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                    <span className="flex-1 truncate">{attachmentLabel}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto p-2">
                  <div className="w-auto space-y-3">
                    {isImage && (
                      <div className="flex max-h-96 w-96 items-center justify-center overflow-hidden rounded-md border">
                        <Image
                          alt={filename || "attachment preview"}
                          className="max-h-full max-w-full object-contain"
                          height={284}
                          src={file.url}
                          width={348}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <div className="min-w-0 flex-1 space-y-1 px-0.5">
                        <h4 className="truncate font-semibold text-sm leading-none">
                          {filename || (isImage ? "Image" : "Attachment")}
                        </h4>
                        <p className="truncate font-mono text-muted-foreground text-xs">
                          {file.mediaType}
                        </p>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      )}
      <div className="border rounded-2xl py-1 px-1.5">
        {/* Textarea */}
        <Textarea
          id="textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="text-sm resize-none outline-none border-none shadow-none pl-2 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full"
          autoFocus
          rows={3}
        />

        {/* Footer with tools and submit */}
        <div className="flex items-center justify-between mt-2 border p-1 rounded-xl">
          <div className="flex items-center gap-1">
            {/* Attachment button */}
            {model.imageSupport === true ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    className="bg-muted text-foreground hover:bg-muted/60 rounded-lg"
                  >
                    <Paperclip className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="ml-8 md:ml-24">
                  <div className="flex flex-col gap-2 size-fit">
                    <Button
                      className="flex gap-2 size-fit bg-transparent text-foreground hover:bg-muted/40"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlusIcon className="size-4" />
                      <p className="text-xs">Attach Files</p>
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      title="Upload files"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              ``
            )}

            {/* Voice button */}
            <Button
              type="button"
              className={cn(
                "transition-all duration-200 bg-muted text-foreground hover:bg-muted/50",
                isListening &&
                  "bg-foreground text-background hover:bg-foreground/50",
              )}
              disabled={!recognition}
              onClick={toggleListening}
            >
              <MicrophoneIcon className="size-4" />
            </Button>

            {model.toolSupport === true ? (
              <div className="flex items-center gap-1">
                {/* Search button */}
                <Button
                  type="button"
                  className={`rounded-lg ${search ? "bg-foreground text-background hover:bg-foreground/60" : "bg-muted text-foreground hover:bg-muted/60"}`}
                  onClick={() => searchHandler(!search)}
                >
                  <Globe className="size-4" />
                  <span className="hidden md:block">Web</span>
                </Button>

                {/* Acad Search button */}
                <Button
                  type="button"
                  className={`rounded-lg ${acadSearch ? "bg-foreground text-background hover:bg-foreground/60" : "bg-muted text-foreground hover:bg-muted/60"}`}
                  onClick={() => acadSearchHandler(!acadSearch)}
                >
                  <GraduationCapIcon className="size-4" />
                  <span className="hidden md:block">Academic</span>
                </Button>
              </div>
            ) : (
              ``
            )}

            {/* Model selector */}
            {isMobile ? (
              <Drawer
                open={modelSelectorOpen}
                onOpenChange={setModelSelectorOpen}
              >
                <DrawerTrigger asChild>
                  <Button
                    type="button"
                    className="bg-muted text-foreground hover:bg-muted/60 rounded-lg"
                    onClick={() => setModelSelectorOpen(true)}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <Image
                        src={`./assets/icons/${model.chefSlug}.svg`}
                        alt=""
                        width={10}
                        height={10}
                      />
                    </div>
                    <p className="text-xs hidden md:block">{model.name}</p>
                    <ChevronDown className="size-3 m-0" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-1 ">
                  <DrawerHeader>
                    <DrawerTitle className="flex gap-2">
                      <CpuIcon /> Select Model
                    </DrawerTitle>
                  </DrawerHeader>
                  <Command className="bg-transparent">
                    <CommandInput
                      className="text-xs"
                      placeholder="Search a model..."
                    />
                    <CommandList className="max-h-[60vh] overflow-y-auto py-1 [&::-webkit-scrollbar]:w-0">
                      <CommandEmpty>No model found.</CommandEmpty>
                      {(() => {
                        const groups = models.reduce<
                          Record<string, (typeof models)[number][]>
                        >((acc, m) => {
                          (acc[m.chef] ||= []).push(m);
                          return acc;
                        }, {});

                        return Object.entries(groups).map(
                          ([chef, chefModels]) => (
                            <CommandGroup
                              key={chef}
                              heading={chef}
                              className="p-0 "
                            >
                              {chefModels.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  className="rounded-full p-2"
                                  onSelect={() => {
                                    modelSelector(item);
                                    setProvider(item.providers[0]);
                                    setModelSelectorOpen(false);
                                  }}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex gap-2 items-center">
                                      <div className="p-0.5 bg-white rounded-full">
                                        <Image
                                          src={`./assets/icons/${item.chefSlug}.svg`}
                                          alt={`${item.chefSlug}`}
                                          width={10}
                                          height={10}
                                        />
                                      </div>
                                      <p className="text-xs font-semibold tracking-wide">
                                        {item.name}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Image
                                        src={`./assets/icons/${item.providers[0]}.svg`}
                                        alt={`${item.providers[0]}`}
                                        width={15}
                                        height={15}
                                        className="rounded-full"
                                      />
                                      {item.id === model.id ? (
                                        <Check />
                                      ) : (
                                        <div className="size-4"></div>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ),
                        );
                      })()}
                    </CommandList>
                  </Command>
                </DrawerContent>
              </Drawer>
            ) : (
              <Popover
                open={modelSelectorOpen}
                onOpenChange={setModelSelectorOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    className="bg-muted text-foreground hover:bg-muted/60 rounded-lg"
                    onClick={() => setModelSelectorOpen(true)}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <Image
                        src={`./assets/icons/${model.chefSlug}.svg`}
                        alt=""
                        width={10}
                        height={10}
                      />
                    </div>
                    <p className="text-xs hidden md:block">{model.name}</p>
                    <ChevronDown className="size-3 m-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 h-70">
                  <Command>
                    <CommandInput
                      className="text-xs"
                      placeholder="Search a model..."
                    />
                    <CommandList className="[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full py-1">
                      <CommandEmpty>No model found.</CommandEmpty>
                      {(() => {
                        const groups = models.reduce<
                          Record<string, (typeof models)[number][]>
                        >((acc, m) => {
                          (acc[m.chef] ||= []).push(m);
                          return acc;
                        }, {});

                        return Object.entries(groups).map(
                          ([chef, chefModels]) => (
                            <CommandGroup className="py-0 px-1" heading={chef}>
                              {chefModels.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  className="rounded-full p-2"
                                  onSelect={() => {
                                    modelSelector(item);
                                    setProvider(item.providers[0]);
                                    setModelSelectorOpen(false);
                                  }}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <div className="flex gap-2 items-center">
                                      <div className="p-0.5 bg-white rounded-full">
                                        <Image
                                          src={`./assets/icons/${item.chefSlug}.svg`}
                                          alt={`${item.chefSlug}`}
                                          width={10}
                                          height={10}
                                        />
                                      </div>
                                      <p className="text-xs">{item.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Image
                                        src={`./assets/icons/${item.providers[0]}.svg`}
                                        alt={`${item.providers[0]}`}
                                        width={15}
                                        height={15}
                                        className="rounded-lg"
                                      />

                                      {item.id === model.id ? (
                                        <Check />
                                      ) : (
                                        <div className="size-4"></div>
                                      )}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ),
                        );
                      })()}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Submit button */}
          {status === "streaming" ? (
            <Button
              className="rounded-lg hover:bg-foreground/80"
              onClick={handleStop}
              aria-label="Stop generating response"
            >
              <SquareIcon weight="fill" className="size-4" />
            </Button>
          ) : (
            <Button
              className="rounded-lg"
              type="submit"
              disabled={
                (!input.trim() && files.length === 0) || status === "submitted"
              }
              aria-label="Send message"
            >
              <SendIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
