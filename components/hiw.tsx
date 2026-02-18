import React from "react";
import { motion } from "framer-motion";
import { Search, Layers, Sparkles, ArrowRight } from "lucide-react";
import { pencil } from "@/public/assets/ai_pen";
import { cn } from "@/lib/utils";

// --- Components ---

const StepCard = ({
  icon: Icon,
  title,
  description,
  stepNumber,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  stepNumber: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="relative flex flex-col items-center text-center group z-10"
    >
      {/* Floating Icon Container */}
      <div className="relative mb-6">
        {/* Animated Glow behind icon */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
        />
        
        {/* Icon Circle */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary border border-foreground/10 shadow-2xl group-hover:border-foreground/20 transition-colors duration-300">
          <Icon className="h-8 w-8 text-foreground group-hover:text-primary transition-colors duration-300" />
          
          {/* Step Badge */}
          <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-foreground/10 text-xs font-bold text-foreground">
            {stepNumber}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-foreground/90 mb-2">{title}</h3>
      <p className="text-sm text-secondary-foreground/70 max-w-[250px] leading-relaxed">
        {description}
      </p>
      
      {/* Mobile-only connector line */}
      <div className="h-12 w-[1px] bg-gradient-to-b from-foreground/20 to-transparent my-4 md:hidden last:hidden" />
    </motion.div>
  );
};

const ConnectingBeam = () => {
  return (
    <div className="hidden md:flex absolute top-10 left-0 w-full justify-between items-center px-24 pointer-events-none z-0">
      {/* Left Beam */}
      <div className="flex-1 h-[1px] bg-foreground/10 relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 opacity-50"
        />
      </div>
      
      {/* Spacer for center card (prevents line going through the middle icon) */}
      <div className="w-40" />

      {/* Right Beam */}
      <div className="flex-1 h-[1px] bg-foreground/10 relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent w-1/2 opacity-50"
        />
      </div>
    </div>
  );
};

const BackgroundGrid = () => (
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_70%,black_100%)]" />
  </div>
);

// --- Main Section ---

const HowItWorks = () => {
  return (
    <section className="relative py-32 bg-background border-y overflow-hidden selection:bg-foreground/20">
      <BackgroundGrid />
      
      <div className="container relative mx-auto px-6 z-10">
        
        {/* Header */}
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold bg-clip-text text-foreground tracking-tight"
          >
            How It Works
          </motion.h2>
        </div>

        {/* Steps Container */}
        <div className="relative max-w-6xl mx-auto">
          <ConnectingBeam />
          
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <StepCard 
              stepNumber="01"
              icon={Search}
              title="Input Query"
              description="Describe your research topic in natural language. We parse intent and context instantly."
              delay={0.2}
            />
            
            <StepCard 
              stepNumber="02"
              icon={Layers}
              title="Multi-Source Scan"
              description="We concurrently query live web data, academic repositories, and real-time APIs."
              delay={0.4}
            />
            
            <StepCard 
              stepNumber="03"
              icon={pencil}
              title="Synthesize"
              description="Our LLMs aggregate the data to produce a comprehensive, cited, and accurate answer."
              delay={0.6}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;