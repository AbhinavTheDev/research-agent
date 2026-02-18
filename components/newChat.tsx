import { Button } from "./ui/button.tsx";
import { PenBoxIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useState } from "react";
import { cn } from "@/lib/utils.ts";

export function NewChat({
  className,
  triggerClass,
  onClick,
  disabled = false,
  hasMessages = false,
}: {
  className?: string;
  triggerClass?: string;
  onClick: () => void;
  disabled?: boolean;
  hasMessages?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirm = () => {
    setIsDialogOpen(false);
    onClick();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(className)}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className={cn(
                    "group text-foreground rounded-lg justify-center items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    triggerClass
                  )}
                  onClick={() => {
                    if (hasMessages) {
                      setIsDialogOpen(true);
                    } else {
                      onClick();
                    }
                  }}
                  disabled={disabled}
                  aria-label="Start a new chat (Ctrl+N on desktop)"
                >
                  <PenBoxIcon className="h-4 w-4" />
                  <p className="hidden md:block">New Chat</p>
                </Button>
              </DialogTrigger>
              {hasMessages && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Chat?</DialogTitle>
                    <DialogDescription>
                      This will clear the current conversation. Are you sure?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Yes, Start New</Button>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Start a new chat</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
