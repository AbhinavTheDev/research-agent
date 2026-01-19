import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/Chat";
import { ModeToggle } from "@/components/mode-toggle";
import { NewChat } from "@/components/newChat";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [chatKey, setChatKey] = useState(Date.now());
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");

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
    <div className="relative h-[93vh] md:h-screen bg-surface text-foreground overflow-hidden">
      <div className="relative flex h-full max-w-full flex-col px-2 py-2">
        <main className="backdrop-panel flex-1 w-full overflow-hidden rounded-2xl border border-white/15">
          <header className="absolute top-4 left-4 z-50">
            <NewChat
              className="md:w-auto w-12 h-12"
              onClick={handleNewChat}
              disabled={status === "streaming"}
              hasMessages={messages.length > 0}
            />
          </header>
          <Chat
            className=""
            key={chatKey}
            onMessagesChange={setMessages}
            onStatusChange={handleStatusChange}
          />
        </main>
      </div>
    </div>
  );
}
