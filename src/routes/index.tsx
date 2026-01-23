import { createFileRoute } from "@tanstack/react-router";
import { Chat } from "@/components/Chat";
import { ModeToggle } from "@/components/mode-toggle";
import { NewChat } from "@/components/newChat";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import GridMotion from "@/components/GridMotion";
import {
  Book,
  Bubbles,
  ChartBarBig,
  Cog,
  Globe,
  MessageCircle,
  Search,
  UsersRound,
} from "lucide-react";
import { useMediaQuery } from "hooks/use-media-query";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [chatKey, setChatKey] = useState(Date.now());
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [webSearch, setWebSearch] = useState(false); // Lifted webSearch state
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
        <main className="backdrop-panel flex-1 w-full overflow-hidden rounded-2xl border border-white/15">
          {/* <div className="absolute w-full h-lg">
            <GridMotion
              items={customIcons}
              gradientColor="#111"
              rows={rows}
              cols={cols}
              webSearch={webSearch}
            />
          </div> */}
          <header className="absolute top-4 left-4 z-50">
            <NewChat
              className="md:w-auto w-12 h-12"
              onClick={handleNewChat}
              disabled={status === "streaming"}
              hasMessages={messages.length > 0}
            />
          </header>
          <Chat
            className="z-50"
            key={chatKey}
            onMessagesChange={setMessages}
            onStatusChange={handleStatusChange}
            webSearch={webSearch}
            setWebSearch={setWebSearch}
          />
        </main>
      </div>
    </div>
  );
}
