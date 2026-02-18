import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChatPage } from "@/pages/Chat";
// import { ModeToggle } from "@/components/mode-toggle";
import { NewChat } from "@/components/newChat";
import { useState } from "react";
// import GridMotion from "@/components/elements/grid-pattern.tsx";
import { Globe, MessageCircle } from "lucide-react";
import { useMediaQuery } from "hooks/use-media-query";
import { chatStore, useChatStore } from "@/utils/store.ts";
// import { DottedGlowBackground } from "@/components/motion/dotted-glow-background";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/pages/Landing";
import { ModeToggle } from "@/components/mode-toggle";

export const Route = createFileRoute("/chat")({
  component: Chat,
});

function Chat() {
  const [chatKey, setChatKey] = useState(Date.now());
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const webSearch = useChatStore((state) => state.webSearch);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const rows = isDesktop ? 5 : 7;
  const cols = isDesktop ? 7 : 4;

  // Define custom icons for the grid background based on webSearch
  const icon = webSearch ? (
    <Globe size={50} color="white" />
  ) : (
    <MessageCircle size={50} color="white" />
  );
  const customIcons = Array.from({ length: rows * cols }, () => icon);

  const handleNewChat = () => {
    setChatKey(Date.now());
    navigate({ to: "/" });
  };

  const handleStatusChange = (status: string) => {
    if (status === "streaming") {
      setStatus("streaming");
    } else {
      setStatus("idle");
    }
  };

  return (
    <div className="relative h-[93vh] md:h-screen bg-background text-foreground overflow-hidden">
      <div className="relative flex h-full max-w-full flex-col px-2 py-2">
        <main className="relative backdrop-panel flex-1 w-full overflow-hidden rounded-xl border border-border">
          {/* <div className="absolute w-full h-lg">
            <GridMotion
              items={customIcons}
              gradientColor="#111"
              rows={rows}
              cols={cols}
              webSearch={webSearch}
            />
          </div> */}
          <header className="absolute h-9 top-2 bg-background ring-1 ring-border rounded-md left-2 z-90">
            <div className="flex items-center">
              <NewChat
                className="md:w-auto w-10 h-12"
                triggerClass="bg-transparent rounded-sm hover:bg-primary/20"
                onClick={handleNewChat}
                disabled={status === "streaming"}
                hasMessages={messages.length > 0}
              />
              <hr className="w-px h-7 mb-3 bg-foreground rounded-full" />
              <div className="h-12 pt-0.5 pr-1 pl-1">
                <ModeToggle className="size-8" />
              </div>
            </div>
          </header>
          <FadeIn delay={0.2}>
            <ChatPage
              className="z-50 relative"
              key={chatKey}
              onMessagesChange={setMessages}
              onStatusChange={handleStatusChange}
            />
          </FadeIn>
          <div
            className={cn(
              "absolute inset-0",
              "[background-size:20px_20px]",
              "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
              "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
            )}
          />
        </main>
      </div>
    </div>
  );
}
