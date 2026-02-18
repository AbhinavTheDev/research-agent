import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
  ArrowRight,
  Search,
  Library,
  ShieldCheck,
  BrainCircuit,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/utils/theme-provider";
import ScrollFloat from "@/components/motion/scroll-float";
import ClickSpark from "@/components/motion/click-spark";
import HowItWorks from "@/components/hiw";
import UseCases from "@/components/uc";

// --- Components ---

export const FadeIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- Sections ---
const Hero = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-10 pt-20 text-center md:pt-32">
      {/*<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] dark:opacity-[0.08]" />*/}
      {/*<div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black">*/}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <FadeIn>
        <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
          <span>Now indexing 474M+ academic works</span>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h1 className="relative mx-auto max-w-4xl text-5xl font-medium !leading-[1.1] tracking-tight text-foreground md:text-7xl">
          Research deeper, <br />
          <span className="text-muted-foreground">faster than ever.</span>
        </h1>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="relative mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Element AI unifies deep web search and academic databases into a
          single, intelligent interface. Stop switching tabs—start synthesizing
          information.
        </p>
      </FadeIn>

      <FadeIn
        delay={0.3}
        className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button asChild size="lg" className="h-10 rounded-md px-8 text-base hover:scale-105 duration-300">
          <Link to="/chat">
            Get Started <ArrowRight className="ml-2 h-4 w-4 " />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Free for basic queries
        </span>
      </FadeIn>
      {/*</div>*/}
      {/* <FadeIn delay={0.4} className="mt-16 sm:mt-24">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground/60">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border border-background bg-muted content-center text-[10px] text-center leading-8"
              >
                <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-muted" />
              </div>
            ))}
          </div>
          <p>Trusted by proactive researchers</p>
        </div>
      </FadeIn> */}
    </section>
  );
};

const PoweredBy = () => {
  const stack = [
    {
      name: "React 19",
      icon: "./assets/icons/react.svg",
      link: "https://react.dev",
      filter: 0,
    },
    {
      name: "TanStack Start",
      icon: "./assets/icons/tanstack.svg",
      link: "https://tanstack.com/start",
      filter: 1,
    },
    {
      name: "Tailwind CSS",
      icon: "./assets/icons/tailwindcss.svg",
      link: "https://tailwindcss.com",
      filter: 0,
    },
    {
      name: "ShadcnUI",
      icon: "./assets/icons/shadcn.svg",
      link: "https://ui.shadcn.com",
      filter: 1,
    },
    {
      name: "Vercel AI SDK",
      icon: "./assets/icons/vercel.svg",
      link: "https://sdk.vercel.ai",
      filter: 1,
    },
    {
      name: "OpenAlex",
      icon: "./assets/icons/openalex.svg",
      link: "https://openalex.org",
      filter: 1,
    },
  ];
  const { theme, setTheme } = useTheme();
  return (
    <section className="py-10 overflow-hidden">
      <div className="container mx-auto px-6 mb-6 text-center">
        <FadeIn delay={0.2}>
          <span className="text-sm font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Possible by
          </span>
        </FadeIn>
      </div>
      <div
        className="relative flex w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex flex-shrink-0 gap-16 pr-16"
        >
          {[...stack, ...stack, ...stack, ...stack].map((tech, i) => (
            <a
              href={tech.link}
              target="_blanck"
              key={i}
              className="flex gap-2 text-xl font-semibold text-foreground/70 whitespace-nowrap select-none"
            >
              <Image
                src={tech.icon}
                alt={tech.name}
                width={20}
                height={20}
                className={tech.filter === 1 ? `${theme}-filter` : ""}
              />
              <p>{tech.name}</p>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  return (
    <section className="border-t bg-muted/20 py-24 md:py-32">
      <div className="container px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
          <FadeIn>
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              The cost of <br /> context switching.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Traditional research is fragmented. You jump between Google,
              Google Scholar, generic LLMs, and endless PDF tabs. This
              fragmentation breaks your flow and wastes hours.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Loss of critical context between searches",
                "Inability to verify LLM hallucinations instantly",
                "Time wasted formatting citations and data",
                "Shallow synthesis due to information overload",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="flex h-1.5 w-1.5 rounded-full bg-destructive/50" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.2}>
            <Card className="border-primary/10 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  The Element Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      Unified Query
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ask once. We query OpenAlex (474M+ papers) and the live
                      web simultaneously.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      Intelligent Synthesis
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Models analyze sources, verify facts, and synthesize a
                      coherent answer.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      Actionable Output
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get citations, deep links, and structured data ready for
                      your work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Horizontal Search",
      description:
        "We don't just search one database. We sweep the entire live web and academic indices simultaneously for maximum coverage.",
    },
    {
      icon: <Library className="h-6 w-6" />,
      title: "Academic Rigor",
      description:
        "Direct integration with OpenAlex provides access to over 474 million scientific works, papers, and journals.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Private & Secure",
      description:
        "Your research data is yours. We strip ad-trackers and prioritize privacy in every query processing step.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <FadeIn>
          <div className="mb-16 md:text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-medium tracking-tight">
              Built for Truth Seekers
            </h2>
            <p className="mt-4 text-muted-foreground">
              Capabilities designed to replace the busywork of research with
              actual discovery.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Card className="h-full border-muted/50 bg-transparent shadow-none transition-colors hover:border-primary/20 hover:bg-muted/10">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-foreground">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// const HowItWorks = () => {
//   return (
//     <section className="py-24 bg-muted/20 border-y border-muted/50">
//       <div className="container mx-auto px-6">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-medium">How it works</h2>
//           </div>
//         </FadeIn>

//         <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//           <FadeIn delay={0.1} className="text-center">
//             <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border">
//               <Search className="h-6 w-6 text-muted-foreground" />
//             </div>
//             <h3 className="font-medium text-lg">1. Input Query</h3>
//             <p className="mt-2 text-sm text-muted-foreground">
//               Describe your research topic in natural language.
//             </p>
//           </FadeIn>
//           <FadeIn delay={0.2} className="text-center">
//             <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border">
//               <Layers className="h-6 w-6 text-muted-foreground" />
//             </div>
//             <h3 className="font-medium text-lg">2. Multi-Source Scan</h3>
//             <p className="mt-2 text-sm text-muted-foreground">
//               We query live web data and academic repositories instantly.
//             </p>
//           </FadeIn>
//           <FadeIn delay={0.3} className="text-center">
//             <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border">
//               <Sparkles className="h-6 w-6 text-muted-foreground" />
//             </div>
//             <h3 className="font-medium text-lg">3. Synthesize</h3>
//             <p className="mt-2 text-sm text-muted-foreground">
//               Receive a comprehensive, cited answer ready for use.
//             </p>
//           </FadeIn>
//         </div>
//       </div>
//     </section>
//   );
// };

// const UseCases = () => {
//   const cases = [
//     {
//       role: "Researchers",
//       benefit: "Literature review in minutes, not days.",
//     },
//     {
//       role: "Developers",
//       benefit: "Find documentation and technical solutions with context.",
//     },
//     {
//       role: "Students",
//       benefit: "Verify sources and deepen understanding instantly.",
//     },
//     {
//       role: "Analysts",
//       benefit: "Gather market intelligence from verified sources.",
//     },
//   ];

//   return (
//     <section className="container mx-auto px-6 py-24 border-y border-muted/30">
//       <FadeIn>
//         <h2 className="mb-12 text-2xl font-medium tracking-tight text-center">
//           Who can use Element AI?
//         </h2>
//       </FadeIn>
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {cases.map((c, i) => (
//           <FadeIn key={i} delay={i * 0.05}>
//             <div className="group relative overflow-hidden rounded-xl border bg-muted/20 p-6 hover:bg-muted/40 transition-colors">
//               <h3 className="font-semibold text-foreground">{c.role}</h3>
//               <p className="mt-2 text-sm text-muted-foreground">{c.benefit}</p>
//             </div>
//           </FadeIn>
//         ))}
//       </div>
//     </section>
//   );
// };

const FAQ = () => {
  const faqs = [
    {
      q: "How is this different from Google or Perplexity?",
      a: "Element AI is specialized for deep research, not casual browsing. We prioritize academic sources (via OpenAlex) and synthesized accuracy over speed-reading news or simple Q&A.",
    },
    {
      q: "Is this a general-purpose AI chatbot?",
      a: "No. Element AI is a research engine. While it uses chat to interact, its primary function is retrieving, verifying, and synthesizing specific information from credible sources.",
    },
    // {
    //   q: "How is my data handled?",
    //   a: "We do not train models on your specific queries. Your research sessions are private and transient by default.",
    // },
    {
      q: "Is it free?",
      a: "Element AI offers a free tier for basic queries. High-volume academic indexing access may require a plan.",
    },
  ];

  return (
    <section className="py-24 px-6 md:pb-40">
      <div className="container mx-auto max-w-3xl">
        <FadeIn>
          <h2 className="mb-12 text-3xl font-medium text-center">
            Common Questions
          </h2>
        </FadeIn>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-medium text-foreground">{faq.q}</h3>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { theme, setTheme } = useTheme();
  return (
    <footer className="border-t py-12 px-6 bg-muted/5">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logo/element-logo.svg"
              alt="element"
              className={cn(theme === "light" ? "light-filter" : "dark-filter")}
              width={30}
              height={30}
            />
            <span className="font-medium text-lg tracking-tight">
              Element AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Built with &#10084; by{" "}
            <a
              href="https://x.com/abhinav_twts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium"
            >
              @abhinav_twts
            </a>
          </p>
        </div>

        <div className="text-sm">
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-foreground">Connect</h4>
            <a
              href="https://github.com/abhinavthedev/research-agent"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Github
            </a>
            <a
              href="https://x.com/abhinav_twts"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LandingPage = () => {
  const { theme, setTheme } = useTheme();
  return (
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
        <nav className="fixed top-0 z-50 w-full  ">
          <div className="container mt-4 md:mt-4 flex h-14 w-[95%] md:w-3/4 items-center justify-between px-2 mx-auto ring-1 ring-border bg-background/80 rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo/element-logo.svg"
                alt="element"
                className={cn(
                  theme === "light" ? "light-filter" : "dark-filter",
                )}
                width={30}
                height={30}
              />
              <span className="font-medium tracking-tight">Element AI</span>
            </div>
            <div className="flex items-center">
              {/* <Link to="/chat" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    Log in
                </Link> */}
              <Button size="sm" asChild className="rounded-md bg-transparent text-foreground hover:bg-primary/20 ring-1 ring-border px-4 text-xs hover:scale-105 duration-300">
                <Link to="/chat">Get Started <ArrowRight className=""/></Link>
              </Button>
              <div className="h-12 px-1 flex items-center">
                <ModeToggle className="size-9" />
              </div>
            </div>
          </div>
        </nav>

        <Hero />
        <PoweredBy />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <UseCases />
        <FAQ />

        <section className="py-24 text-center font-sans">
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
          >
            Ready to research?
          </ScrollFloat>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-8 text-base"
            >
              <Link to="/chat">
                Start Researching <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <Footer />
      </main>
    </ClickSpark>
  );
};
