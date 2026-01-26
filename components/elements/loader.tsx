import { cn } from "@/lib/utils.ts";
import { TextLoop } from "../motion/text-loop.tsx";
import { motion } from "motion/react";
import React from "react";

export const Loader = (className) => {
  const transition = (x: number) => {
    return {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: x * 0.2,
      ease: "easeInOut",
    };
  };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        initial={{
          y: 0,
        }}
        animate={{
          y: [0, 10, 0],
        }}
        transition={transition(0)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
      <motion.div
        initial={{
          y: 0,
        }}
        animate={{
          y: [0, 10, 0],
        }}
        transition={transition(1)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
      <motion.div
        initial={{
          y: 0,
        }}
        animate={{
          y: [0, 10, 0],
        }}
        transition={transition(2)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
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
