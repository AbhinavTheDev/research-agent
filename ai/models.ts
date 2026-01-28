export type ModelProps = {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
  toolSupport?: boolean;
  imageSupport?: boolean;
};

export const models = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
    toolSupport: true,
    imageSupport: true,
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
    toolSupport: true,
    imageSupport: true,

  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
    toolSupport: true,
    imageSupport: true,
  },
  // {
  //   id: "qwen/qwen3-32b",
  //   name: "Qwen 3",
  //   chef: "Qwen",
  //   chefSlug: "qwen",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: false,
  // },
  // {
  //   id: "moonshotai/kimi-k2-instruct-0905",
  //   name: "Kimi K2",
  //   chef: "MoonshotAI",
  //   chefSlug: "moonshotai",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: false,
  // },
  // {
  //   id: "openai/gpt-oss-20b",
  //   name: "GPT OSS 20B",
  //   chef: "OpenAI",
  //   chefSlug: "openai",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: false,
  // },
  // {
  //   id: "openai/gpt-oss-120b",
  //   name: "GPT OSS 120B",
  //   chef: "OpenAI",
  //   chefSlug: "openai",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: false,
  // },
  // {
  //   id: "openai/gpt-oss-safeguard-20b",
  //   name: "Safety GPT OSS 20B",
  //   chef: "OpenAI",
  //   chefSlug: "openai",
  //   providers: ["groq"],
  //   imageSupport: false,
  // },
  // {
  //   id: "meta-llama/llama-4-maverick-17b-128e-instruct",
  //   name: "Llama 4 Maverick",
  //   chef: "Meta",
  //   chefSlug: "meta",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: true,
  // },
  // {
  //   id: "meta-llama/llama-4-scout-17b-16e-instruct",
  //   name: "Llama 4 Scout",
  //   chef: "Meta",
  //   chefSlug: "meta",
  //   providers: ["groq"],
  //   toolSupport: true,
  //   imageSupport: true,
  // },
  // {
  //   id: "deepseek-r1:1.5b",
  //   name: "Deepseek R1",
  //   chef: "Deepseek",
  //   chefSlug: "deepseek",
  //   providers: ["ollama"],
  //   toolSupport: false,
  //   imageSupport: false,
  // },
]
