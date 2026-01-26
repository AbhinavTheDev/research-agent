import { cn } from "@/lib/utils.ts";
import { TextLoop } from "../motion/text-loop.tsx";
import { Spinner } from "../ui/spinner.tsx";

export const Loader = () => {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  );
};

export function TextLoopLoader() {
  return (
    <TextLoop className="font-mono text-sm text-muted-foreground">
      <span>Brewing fresh ideas...</span>
      <span>Consulting the digital oracle...</span>
      <span>Engaging the thought engine...</span>
      <span>Gathering stardust and logic...</span>
      <span>Synthesizing neural pathways...</span>
      <span>Distilling complexity into clarity...</span>
      <span>Harmonizing data streams...</span>
      <span>Architecting cognitive sequences...</span>
      <span>Orchestrating creative flow...</span>
      <span>Decoding systemic patterns...</span>
      <span>Igniting the spark of insight...</span>
    </TextLoop>
  );
}
