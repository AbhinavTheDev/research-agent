import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Microscope, 
  Code2, 
  GraduationCap, 
  LineChart, 
  ArrowRight 
} from "lucide-react";

// --- Utility for merging classes (optional if you don't have clsx/tailwind-merge) ---
// If you have a 'cn' utility, import it. Otherwise, use this simple one:
const cn = (...classes: (string | undefined | null | false)[]) => 
  classes.filter(Boolean).join(" ");

// --- Data ---
const cases = [
  {
    role: "Researchers",
    benefit: "Accelerate literature review. Digest complex papers in minutes, not days.",
    icon: Microscope,
    color: "from-blue-500/20 via-cyan-500/20 to-transparent",
    iconColor: "text-blue-400",
  },
  {
    role: "Developers",
    benefit: "Context-aware documentation search. Find technical solutions and snippets instantly.",
    icon: Code2,
    color: "from-emerald-500/20 via-green-500/20 to-transparent",
    iconColor: "text-emerald-400",
  },
  {
    role: "Students",
    benefit: "Deepen understanding. Verify sources and generate study guides from raw notes.",
    icon: GraduationCap,
    color: "from-orange-500/20 via-yellow-500/20 to-transparent",
    iconColor: "text-orange-400",
  },
  {
    role: "Analysts",
    benefit: "Market intelligence extraction. Synthesize reports from verified global sources.",
    icon: LineChart,
    color: "from-purple-500/20 via-pink-500/20 to-transparent",
    iconColor: "text-purple-400",
  },
];

// --- Sub-Component: Spotlight Card ---
const SpotlightCard = ({ item, index }: { item: typeof cases[0]; index: number }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-secondary-900/50 px-6 py-8 shadow-2xl transition-colors hover:border-foreground/20"
      tabIndex={0} // Make focusable for accessibility
    >
      {/* 1. The Spotlight Gradient Overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      {/* 2. The Color Glow (Unique per card) */}
      <div 
        className={cn(
            "absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150", 
            item.color
        )} 
      />

      {/* 3. Card Content */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Header: Icon & Role */}
        <div className="mb-6 flex items-center justify-between">
            <div className={cn("rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors group-hover:bg-white/10", item.iconColor)}>
                <item.icon className="h-6 w-6" />
            </div>
            {/* Subtle arrow that appears on hover */}
            <ArrowRight className="h-5 w-5 -translate-x-4 text-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>

        <h3 className="text-xl font-semibold text-foreground">
          {item.role}
        </h3>
        
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90 group-hover:text-muted-foreground/70 transition-colors">
          {item.benefit}
        </p>
      </div>

      {/* Bottom Border Highlight */}
      <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </motion.div>
  );
};

// --- Main Section Component ---
const UseCases = () => {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
        {/* Background ambient noise/texture (optional) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        
        <div className="container relative mx-auto px-6">
            {/* Section Header */}
            <div className="mb-16 md:text-center max-w-3xl mx-auto">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-3xl"
                >
                    Who is Element AI for?
                </motion.h2>
                {/*<motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 text-md  text-neutral-400"
                >
                    Whether you are synthesizing academic papers or debugging complex codebases, our engine adapts to your workflow.
                </motion.p>*/}
            </div>

            {/* Grid Layout */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cases.map((item, index) => (
                    <SpotlightCard key={index} item={item} index={index} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default UseCases;